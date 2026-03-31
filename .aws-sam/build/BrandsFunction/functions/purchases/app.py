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
                        p.purchase_id,
                        p.purchase_date,
                        CONCAT('PU', LPAD(p.purchase_id, 4, '0')) AS purchase_code,
                        p.status AS purchase_status,
                        p.reference_no,
                        s.supplier_name,
                        p.total_amount AS total,
                        p.paid_amount AS paid_payment,
                        p.due_amount AS due,
                        CASE 
                            WHEN p.due_amount = 0 THEN 'Paid'
                            WHEN p.paid_amount = 0 THEN 'Unpaid'
                            ELSE 'Partial'
                        END AS payment_status,
                        p.created_by
                    FROM purchases p
                    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
                    WHERE p.purchase_id=%s
                """, (params["id"],))

                purchase = cursor.fetchone()

                if purchase:
                    # fetch items
                    cursor.execute("""
                        SELECT pi.*, pr.item_name
                        FROM purchase_items pi
                        LEFT JOIN products pr ON pi.product_id = pr.product_id
                        WHERE pi.purchase_id=%s
                    """, (params["id"],))

                    items = cursor.fetchall()
                    purchase["items"] = items

                return response(purchase)

            else:
                cursor.execute("""
                    SELECT 
                        p.purchase_id,
                        p.purchase_date,
                        CONCAT('PU', LPAD(p.purchase_id, 4, '0')) AS purchase_code,
                        p.status AS purchase_status,
                        p.reference_no,
                        s.supplier_name,
                        p.total_amount AS total,
                        p.paid_amount AS paid_payment,
                        p.due_amount AS due,
                        CASE 
                            WHEN p.due_amount = 0 THEN 'Paid'
                            WHEN p.paid_amount = 0 THEN 'Unpaid'
                            ELSE 'Partial'
                        END AS payment_status,
                        p.created_by
                    FROM purchases p
                    LEFT JOIN suppliers s ON p.supplier_id = s.supplier_id
                    ORDER BY p.purchase_id DESC
                """)

                data = cursor.fetchall()

                return response(data)

        # -----------------------
        # POST (CREATE)
        # -----------------------
        if method == "POST":

            body = json.loads(event["body"])

            items = body.get("items", [])
            payment = body.get("payment", {})

            # insert purchase
            cursor.execute("""
                INSERT INTO purchases
                (supplier_id,purchase_date,reference_no,total_amount,
                 paid_amount,due_amount,status,created_by)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                body.get("supplier_id"),
                body.get("purchase_date"),
                body.get("reference_no"),
                body.get("total_amount", 0),
                body.get("paid_amount", 0),
                body.get("due_amount", 0),
                body.get("status", "Received"),
                body.get("created_by", 1)
            ))

            purchase_id = cursor.lastrowid

            # insert items
            for item in items:
                cursor.execute("""
                    INSERT INTO purchase_items
                    (purchase_id,product_id,quantity,unit_price,tax_amount,total_amount)
                    VALUES (%s,%s,%s,%s,%s,%s)
                """, (
                    purchase_id,
                    item["product_id"],
                    item["quantity"],
                    item.get("unit_price", 0),
                    item.get("tax_amount", 0),
                    item.get("total_amount", 0)
                ))

                # update stock
                cursor.execute("""
                    UPDATE products
                    SET current_stock = current_stock + %s
                    WHERE product_id = %s
                """, (
                    item["quantity"],
                    item["product_id"]
                ))

            # insert payment
            if payment:
                cursor.execute("""
                    INSERT INTO purchase_payments
                    (purchase_id,payment_date,payment_type_id,amount,note)
                    VALUES (%s,%s,%s,%s,%s)
                """, (
                    purchase_id,
                    payment.get("payment_date"),
                    payment.get("payment_type_id"),
                    payment.get("amount", 0),
                    payment.get("note")
                ))

            conn.commit()

            return response({"message": "Purchase created successfully"})

        # -----------------------
        # PUT (UPDATE)
        # -----------------------
        if method == "PUT":

            if not params.get("id"):
                return error_response("Purchase id required", 400)

            body = json.loads(event["body"])

            cursor.execute("""
                UPDATE purchases
                SET supplier_id=%s,
                    purchase_date=%s,
                    reference_no=%s,
                    total_amount=%s,
                    paid_amount=%s,
                    due_amount=%s,
                    status=%s
                WHERE purchase_id=%s
            """, (
                body.get("supplier_id"),
                body.get("purchase_date"),
                body.get("reference_no"),
                body.get("total_amount"),
                body.get("paid_amount"),
                body.get("due_amount"),
                body.get("status"),
                params["id"]
            ))

            conn.commit()

            return response({"message": "Purchase updated successfully"})

        # -----------------------
        # DELETE
        # -----------------------
        if method == "DELETE":

            if not params.get("id"):
                return error_response("Purchase id required", 400)

            cursor.execute(
                "DELETE FROM purchases WHERE purchase_id=%s",
                (params["id"],)
            )

            conn.commit()

            return response({"message": "Purchase deleted successfully"})

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