import json
import decimal
from datetime import datetime, date
from database.db import get_connection


# -----------------------
# JSON Encoder
# -----------------------
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)


# -----------------------
# MAIN HANDLER
# -----------------------
def lambda_handler(event, context):

    conn = None
    cursor = None

    try:
        method = event.get("httpMethod")
        params = event.get("queryStringParameters") or {}

        conn = get_connection()
        cursor = conn.cursor()

        # -----------------------
        # GET
        # -----------------------
        if method == "GET":

            if params.get("id"):
                cursor.execute("""
                    SELECT 
                        pr.purchase_return_id,
                        pr.return_date,
                        CONCAT('PR', LPAD(pr.purchase_return_id, 4, '0')) AS return_code,
                        pr.status,
                        pr.reference_no,
                        s.supplier_name,
                        pr.total_amount AS total,
                        pr.paid_amount AS paid_payment,
                        pr.due_amount AS due,
                        CASE 
                            WHEN pr.due_amount = 0 THEN 'Paid'
                            WHEN pr.paid_amount = 0 THEN 'Unpaid'
                            ELSE 'Partial'
                        END AS payment_status,
                        pr.created_by
                    FROM purchase_returns pr
                    LEFT JOIN purchases p ON pr.purchase_id = p.purchase_id
                    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
                    WHERE pr.purchase_return_id=%s
                """, (params["id"],))

                data = cursor.fetchone()

                if data:
                    cursor.execute("""
                        SELECT pri.*, prd.item_name
                        FROM purchase_return_items pri
                        LEFT JOIN products prd ON pri.product_id = prd.product_id
                        WHERE pri.purchase_return_id=%s
                    """, (params["id"],))

                    items = cursor.fetchall()
                    data["items"] = items

                return response(data)

            else:
                cursor.execute("""
                    SELECT 
                        pr.purchase_return_id,
                        DATE_FORMAT(pr.return_date, '%d-%m-%Y') AS return_date,
                        CONCAT('PR', LPAD(pr.purchase_return_id, 4, '0')) AS return_code,
                        CONCAT('PU', LPAD(p.purchase_id, 4, '0')) AS purchase_code,
                        pr.status,
                        pr.reference_no,
                        s.supplier_name,
                        pr.total_amount AS total,
                        pr.paid_amount AS paid_payment,
                        pr.due_amount AS due,
                        CASE 
                            WHEN pr.due_amount = 0 THEN 'Paid'
                            WHEN pr.paid_amount = 0 THEN 'Unpaid'
                            ELSE 'Partial'
                        END AS payment_status,
                        pr.created_by
                    FROM purchase_returns pr
                    LEFT JOIN purchases p ON pr.purchase_id = p.purchase_id
                    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
                    ORDER BY pr.purchase_return_id DESC
                """)

                data = cursor.fetchall()
                return response(data)

        # -----------------------
        # POST
        # -----------------------
        if method == "POST":

            body = json.loads(event["body"])
            items = body.get("items", [])
            payment = body.get("payment", {})

            subtotal = 0

            # 🔥 calculate total
            for item in items:
                qty = int(item["quantity"])
                price = float(item.get("unit_price", 0))
                discount = float(item.get("discount", 0))
                tax = float(item.get("tax_amount", 0))

                item_total = (qty * price) - discount + tax
                subtotal += item_total

            other_charges = float(body.get("other_charges", 0))
            discount_on_all = float(body.get("discount_on_all", 0))

            total_amount = subtotal + other_charges - discount_on_all
            paid_amount = float(payment.get("amount", 0)) if payment else 0
            due_amount = total_amount - paid_amount

            # insert purchase return
            cursor.execute("""
                INSERT INTO purchase_returns
                (purchase_id, return_date, reference_no, status,
                 subtotal, other_charges, discount_on_all,
                 total_amount, paid_amount, due_amount,
                 note, created_by)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                body["purchase_id"],
                body["return_date"],
                body.get("reference_no"),
                body.get("status", "Return"),
                subtotal,
                other_charges,
                discount_on_all,
                total_amount,
                paid_amount,
                due_amount,
                body.get("note"),
                body.get("created_by", 1)
            ))

            purchase_return_id = cursor.lastrowid

            # 🔥 insert items + decrease stock
            for item in items:

                product_id = item["product_id"]
                qty = int(item["quantity"])

                price = float(item.get("unit_price", 0))
                discount = float(item.get("discount", 0))
                tax = float(item.get("tax_amount", 0))

                item_total = (qty * price) - discount + tax

                cursor.execute("""
                    INSERT INTO purchase_return_items
                    (purchase_return_id, product_id, quantity,
                     unit_price, discount, tax_amount, total_amount)
                    VALUES (%s,%s,%s,%s,%s,%s,%s)
                """, (
                    purchase_return_id,
                    product_id,
                    qty,
                    price,
                    discount,
                    tax,
                    item_total
                ))

                # 🔥 STOCK DECREASE
                cursor.execute("""
                    UPDATE products
                    SET current_stock = current_stock - %s
                    WHERE product_id = %s
                """, (qty, product_id))

            # 🔥 insert payment
            if payment:
                cursor.execute("""
                    INSERT INTO purchase_return_payments
                    (purchase_return_id, payment_date, payment_type_id, amount, note)
                    VALUES (%s,%s,%s,%s,%s)
                """, (
                    purchase_return_id,
                    payment.get("payment_date"),
                    payment.get("payment_type_id"),
                    payment.get("amount", 0),
                    payment.get("note")
                ))

            conn.commit()

            return response({"message": "Purchase return created successfully"})

        # -----------------------
        # PUT
        # -----------------------
        if method == "PUT":

            if not params.get("id"):
                return error_response("ID required", 400)

            body = json.loads(event["body"])

            cursor.execute("""
                UPDATE purchase_returns
                SET purchase_id=%s,
                    return_date=%s,
                    reference_no=%s,
                    status=%s,
                    total_amount=%s,
                    paid_amount=%s,
                    due_amount=%s,
                    note=%s
                WHERE purchase_return_id=%s
            """, (
                body.get("purchase_id"),
                body.get("return_date"),
                body.get("reference_no"),
                body.get("status"),
                body.get("total_amount"),
                body.get("paid_amount"),
                body.get("due_amount"),
                body.get("note"),
                params["id"]
            ))

            conn.commit()

            return response({"message": "Updated successfully"})

        # -----------------------
        # DELETE
        # -----------------------
        if method == "DELETE":

            if not params.get("id"):
                return error_response("ID required", 400)

            purchase_return_id = params["id"]

            # 🔥 1. Retrieve items to reverse stock updates
            cursor.execute("SELECT product_id, quantity FROM purchase_return_items WHERE purchase_return_id=%s", (purchase_return_id,))
            returned_items = cursor.fetchall()
            
            # Since Purchase Return *decreased* stock, deleting it must *increase* stock back
            for item in returned_items:
                cursor.execute("""
                    UPDATE products 
                    SET current_stock = current_stock + %s 
                    WHERE product_id = %s
                """, (item["quantity"], item["product_id"]))

            # 🔥 2. Wipe child rows to prevent MySQL Foreign Key Constraint errors
            cursor.execute("DELETE FROM purchase_return_payments WHERE purchase_return_id=%s", (purchase_return_id,))
            cursor.execute("DELETE FROM purchase_return_items WHERE purchase_return_id=%s", (purchase_return_id,))

            # 🔥 3. Wipe parent row
            cursor.execute("DELETE FROM purchase_returns WHERE purchase_return_id=%s", (purchase_return_id,))

            conn.commit()

            return response({"message": "Deleted successfully"})

        return error_response("Unsupported method", 405)

    except Exception as e:
        print("ERROR:", str(e))
        return error_response(str(e), 500)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# -----------------------
# RESPONSE
# -----------------------
def response(data):
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(data, cls=DecimalEncoder)
    }


def error_response(message, code=500):
    return {
        "statusCode": code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({"error": message})
    }