import json
import decimal
from datetime import datetime, date
from database.db import get_connection

# DictCursor is enabled globally in db.py
# so cursor.fetchone() always returns a dict, cursor.fetchall() returns list of dicts


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

            # 🔹 SINGLE SALE
            if params.get("id"):
                cursor.execute("""
                    SELECT 
                        s.sale_id,
                        s.sales_date,
                        CONCAT('SL', LPAD(s.sale_id, 4, '0')) AS sales_code,
                        s.status AS sales_status,
                        s.reference_no,
                        c.customer_name,
                        s.total_amount AS total,
                        s.paid_amount AS paid_payment,
                        s.due_amount AS due,
                        CASE 
                            WHEN s.due_amount = 0 THEN 'Paid'
                            WHEN s.paid_amount = 0 THEN 'Unpaid'
                            ELSE 'Partial'
                        END AS payment_status,
                        s.created_by
                    FROM sales s
                    LEFT JOIN customers c ON s.customer_id = c.customer_id
                    WHERE s.sale_id=%s
                """, (params["id"],))

                sale = cursor.fetchone()

                if sale:
                    # 🔹 items
                    cursor.execute("""
                        SELECT si.*, p.item_name
                        FROM sale_items si
                        LEFT JOIN products p ON si.product_id = p.product_id
                        WHERE si.sale_id=%s
                    """, (params["id"],))
                    sale["items"] = cursor.fetchall()

                    # 🔹 payments
                    cursor.execute("""
                        SELECT * FROM sale_payments
                        WHERE sale_id=%s
                    """, (params["id"],))
                    sale["payments"] = cursor.fetchall()

                return response(sale)

            # 🔹 SALES LIST (UI TABLE)
            else:
                cursor.execute("""
                    SELECT 
                        s.sale_id,
                        s.sales_date,
                        CONCAT('SL', LPAD(s.sale_id, 4, '0')) AS sales_code,
                        s.status AS sales_status,
                        s.reference_no,
                        c.customer_name,
                        s.total_amount AS total,
                        s.paid_amount AS paid_payment,
                        s.due_amount AS due,
                        CASE 
                            WHEN s.due_amount = 0 THEN 'Paid'
                            WHEN s.paid_amount = 0 THEN 'Unpaid'
                            ELSE 'Partial'
                        END AS payment_status,
                        s.created_by
                    FROM sales s
                    LEFT JOIN customers c ON s.customer_id = c.customer_id
                    ORDER BY s.sale_id DESC
                """)

                data = cursor.fetchall()
                return response(data)

        # -----------------------
        # POST (CREATE SALE)
        # -----------------------
        if method == "POST":

            body = json.loads(event["body"])

            items = body.get("items", [])
            payment = body.get("payment", {})

            total_amount = 0

            # 🔹 Calculate total
            for item in items:
                qty = int(item["quantity"])
                price = float(item.get("unit_price", 0))
                discount = float(item.get("discount", 0))
                tax = float(item.get("tax_amount", 0))

                item_total = (qty * price) - discount + tax
                total_amount += item_total

            other_charges = body.get("other_charges", 0)
            discount_on_all = body.get("discount_on_all", 0)

            grand_total = total_amount + other_charges - discount_on_all
            paid_amount = payment.get("amount", 0)
            due_amount = grand_total - paid_amount

            # 🔹 Insert into sales
            cursor.execute("""
                INSERT INTO sales
                (customer_id, sales_date, reference_no, total_amount,
                 paid_amount, due_amount, status, created_by)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                body.get("customer_id"),
                body.get("sale_date"),
                body.get("reference_no"),
                grand_total,
                paid_amount,
                due_amount,
                body.get("status", "Final"),
                body.get("created_by", 1)
            ))

            sale_id = cursor.lastrowid

            # 🔹 Insert items + reduce stock
            for item in items:
                product_id = int(item["product_id"])
                qty = int(item["quantity"])

                cursor.execute("""
                    SELECT current_stock FROM products
                    WHERE product_id=%s
                """, (product_id,))

                result = cursor.fetchone()

                if result is None:
                    raise Exception(f"Product {product_id} not found in database")

                stock = int(result["current_stock"])  # DictCursor returns dict

                print(f"DEBUG: product_id={product_id}, stock={stock}, qty={qty}")

                if stock < qty:
                    raise Exception(f"Insufficient stock for product {product_id} (stock={stock}, requested={qty})")

                price = float(item.get("unit_price", 0))
                discount = float(item.get("discount", 0))
                tax = float(item.get("tax_amount", 0))
                item_total = (qty * price) - discount + tax

                # insert item
                cursor.execute("""
                    INSERT INTO sale_items
                    (sale_id, product_id, quantity, unit_price,
                     tax_amount, total_amount)
                    VALUES (%s,%s,%s,%s,%s,%s)
                """, (
                    sale_id,
                    product_id,
                    qty,
                    price,
                    tax,
                    item_total
                ))

                # reduce stock
                cursor.execute("""
                    UPDATE products
                    SET current_stock = current_stock - %s
                    WHERE product_id = %s
                """, (qty, product_id))

            # 🔹 Insert payment
            if payment:
                cursor.execute("""
                    INSERT INTO sale_payments
                    (sale_id, payment_date, payment_type_id, amount, note)
                    VALUES (%s,%s,%s,%s,%s)
                """, (
                    sale_id,
                    payment.get("payment_date"),
                    payment.get("payment_type_id"),
                    payment.get("amount", 0),
                    payment.get("note")
                ))

            conn.commit()

            return response({"message": "Sale created successfully"})

        # -----------------------
        # PUT
        # -----------------------
        if method == "PUT":

            if not params.get("id"):
                return error_response("Sale id required", 400)

            body = json.loads(event["body"])

            cursor.execute("""
                UPDATE sales
                SET customer_id=%s,
                    sales_date=%s,
                    reference_no=%s,
                    total_amount=%s,
                    paid_amount=%s,
                    due_amount=%s,
                    status=%s
                WHERE sale_id=%s
            """, (
                body.get("customer_id"),
                body.get("sale_date"),
                body.get("reference_no"),
                body.get("total_amount"),
                body.get("paid_amount"),
                body.get("due_amount"),
                body.get("status"),
                params["id"]
            ))

            conn.commit()

            return response({"message": "Sale updated successfully"})

        # -----------------------
        # DELETE
        # -----------------------
        if method == "DELETE":

            if not params.get("id"):
                return error_response("Sale id required", 400)

            cursor.execute(
                "DELETE FROM sales WHERE sale_id=%s",
                (params["id"],)
            )

            conn.commit()

            return response({"message": "Sale deleted successfully"})

        return error_response("Unsupported method", 405)

    except Exception as e:
        print("ERROR:", repr(e))
        return error_response(repr(e), 500)

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