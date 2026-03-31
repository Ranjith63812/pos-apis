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

            cursor.execute("""
                SELECT 
                    sr.sale_return_id,
                    DATE_FORMAT(sr.return_date, '%d-%m-%Y') AS sales_date,
                    CONCAT('SR', LPAD(sr.sale_return_id, 4, '0')) AS return_code,
                    CONCAT('SL', LPAD(s.sale_id, 4, '0')) AS sales_code,
                    sr.status,
                    sr.reference_no,
                    c.customer_name,
                    sr.total_amount AS total,
                    sr.paid_amount AS paid_payment,
                    sr.due_amount AS due,
                    CASE 
                        WHEN sr.due_amount = 0 THEN 'Paid'
                        WHEN sr.paid_amount = 0 THEN 'Unpaid'
                        ELSE 'Partial'
                    END AS payment_status,
                    sr.created_by
                FROM sale_returns sr
                LEFT JOIN sales s ON sr.sale_id = s.sale_id
                LEFT JOIN customers c ON s.customer_id = c.customer_id
                ORDER BY sr.sale_return_id DESC
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

            # insert return
            cursor.execute("""
                INSERT INTO sale_returns
                (sale_id, return_date, reference_no, status,
                 subtotal, other_charges, discount_on_all,
                 total_amount, paid_amount, due_amount,
                 note, created_by)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                body["sale_id"],
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

            sale_return_id = cursor.lastrowid

            # insert items + stock increase
            for item in items:

                product_id = item["product_id"]
                qty = int(item["quantity"])

                price = float(item.get("unit_price", 0))
                discount = float(item.get("discount", 0))
                tax = float(item.get("tax_amount", 0))

                item_total = (qty * price) - discount + tax

                cursor.execute("""
                    INSERT INTO sale_return_items
                    (sale_return_id, product_id, quantity,
                     unit_price, discount, tax_amount, total_amount)
                    VALUES (%s,%s,%s,%s,%s,%s,%s)
                """, (
                    sale_return_id,
                    product_id,
                    qty,
                    price,
                    discount,
                    tax,
                    item_total
                ))

                # 🔥 STOCK INCREASE
                cursor.execute("""
                    UPDATE products
                    SET current_stock = current_stock + %s
                    WHERE product_id = %s
                """, (qty, product_id))

            # payment
            if payment:
                cursor.execute("""
                    INSERT INTO sale_return_payments
                    (sale_return_id, payment_date, payment_type_id, amount, note)
                    VALUES (%s,%s,%s,%s,%s)
                """, (
                    sale_return_id,
                    payment.get("payment_date"),
                    payment.get("payment_type_id"),
                    payment.get("amount", 0),
                    payment.get("note")
                ))

            conn.commit()

            return response({"message": "Sales return created successfully"})

        # -----------------------
        # DELETE
        # -----------------------
        if method == "DELETE":

            if not params.get("id"):
                return error_response("ID required", 400)

            sale_return_id = params["id"]

            # 🔥 1. Retrieve items to reverse stock updates
            cursor.execute("SELECT product_id, quantity FROM sale_return_items WHERE sale_return_id=%s", (sale_return_id,))
            returned_items = cursor.fetchall()
            
            # Since Sales Return *increased* stock, deleting it must *decrease* stock back
            for item in returned_items:
                cursor.execute("""
                    UPDATE products 
                    SET current_stock = current_stock - %s 
                    WHERE product_id = %s
                """, (item["quantity"], item["product_id"]))

            # 🔥 2. Wipe child rows to prevent MySQL Foreign Key Constraint errors
            cursor.execute("DELETE FROM sale_return_payments WHERE sale_return_id=%s", (sale_return_id,))
            cursor.execute("DELETE FROM sale_return_items WHERE sale_return_id=%s", (sale_return_id,))

            # 🔥 3. Wipe parent row
            cursor.execute("DELETE FROM sale_returns WHERE sale_return_id=%s", (sale_return_id,))

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