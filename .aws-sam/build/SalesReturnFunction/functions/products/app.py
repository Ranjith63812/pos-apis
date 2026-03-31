import json
import decimal
from datetime import datetime, date, time
from database.db import get_connection


# -----------------------
# JSON Encoder
# -----------------------

class DecimalEncoder(json.JSONEncoder):

    def default(self, obj):

        if isinstance(obj, decimal.Decimal):
            return float(obj)

        if isinstance(obj, (datetime, date, time)):
            return obj.isoformat()

        return super().default(obj)


# -----------------------
# Lambda Handler
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

                cursor.execute(
                    """
                    SELECT
                        p.*,
                        b.brand_name,
                        c.category_name,
                        u.unit_name,
                        t.tax_name,
                        t.tax_percentage
                    FROM products p
                    LEFT JOIN brands b ON p.brand_id = b.brand_id
                    LEFT JOIN categories c ON p.category_id = c.category_id
                    LEFT JOIN units u ON p.unit_id = u.unit_id
                    LEFT JOIN taxes t ON p.tax_id = t.tax_id
                    WHERE p.product_id = %s
                    """,
                    (params["id"],)
                )

                data = cursor.fetchone()

            else:

                cursor.execute(
                    """
                    SELECT
                        p.*,
                        b.brand_name,
                        c.category_name,
                        u.unit_name,
                        t.tax_name,
                        t.tax_percentage
                    FROM products p
                    LEFT JOIN brands b ON p.brand_id = b.brand_id
                    LEFT JOIN categories c ON p.category_id = c.category_id
                    LEFT JOIN units u ON p.unit_id = u.unit_id
                    LEFT JOIN taxes t ON p.tax_id = t.tax_id
                    """
                )

                data = cursor.fetchall()

            return response(data)


        # -----------------------
        # POST
        # -----------------------
        if method == "POST":

            if not event.get("body"):
                return error_response("Request body is required", 400)

            body = json.loads(event["body"])

            if "item_name" not in body:
                return error_response("item_name is required", 400)

            cursor.execute(
                """
                INSERT INTO products
                (item_code,item_name,brand_id,category_id,unit_id,sku,hsn,barcode,
                minimum_qty,description,price,tax_id,tax_type,purchase_price,
                profit_margin,sales_price,final_price,discount_type,discount,
                expire_date,product_image,status)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    body.get("item_code"),
                    body["item_name"],
                    body.get("brand_id"),
                    body.get("category_id"),
                    body.get("unit_id"),
                    body.get("sku"),
                    body.get("hsn"),
                    body.get("barcode"),
                    body.get("minimum_qty"),
                    body.get("description"),
                    body.get("price"),
                    body.get("tax_id"),
                    body.get("tax_type"),
                    body.get("purchase_price"),
                    body.get("profit_margin"),
                    body.get("sales_price"),
                    body.get("final_price"),
                    body.get("discount_type"),
                    body.get("discount"),
                    body.get("expire_date"),
                    body.get("product_image"),
                    body.get("status", 1)
                )
            )

            conn.commit()

            return response({"message": "Product created successfully"})


        # -----------------------
        # PUT
        # -----------------------
        if method == "PUT":

            if not params.get("id"):
                return error_response("Product id required", 400)

            if not event.get("body"):
                return error_response("Request body required", 400)

            body = json.loads(event["body"])

            if "item_name" not in body:
                return error_response("item_name is required", 400)

            cursor.execute(
                """
                UPDATE products
                SET item_code=%s,item_name=%s,brand_id=%s,category_id=%s,
                unit_id=%s,sku=%s,hsn=%s,barcode=%s,minimum_qty=%s,
                description=%s,price=%s,tax_id=%s,tax_type=%s,
                purchase_price=%s,profit_margin=%s,sales_price=%s,
                final_price=%s,discount_type=%s,discount=%s,
                expire_date=%s,product_image=%s,status=%s
                WHERE product_id=%s
                """,
                (
                    body.get("item_code"),
                    body["item_name"],
                    body.get("brand_id"),
                    body.get("category_id"),
                    body.get("unit_id"),
                    body.get("sku"),
                    body.get("hsn"),
                    body.get("barcode"),
                    body.get("minimum_qty"),
                    body.get("description"),
                    body.get("price"),
                    body.get("tax_id"),
                    body.get("tax_type"),
                    body.get("purchase_price"),
                    body.get("profit_margin"),
                    body.get("sales_price"),
                    body.get("final_price"),
                    body.get("discount_type"),
                    body.get("discount"),
                    body.get("expire_date"),
                    body.get("product_image"),
                    body.get("status", 1),
                    params["id"]
                )
            )

            conn.commit()

            return response({"message": "Product updated successfully"})


        # -----------------------
        # DELETE
        # -----------------------
        if method == "DELETE":

            if not params.get("id"):
                return error_response("Product id required", 400)

            cursor.execute(
                "DELETE FROM products WHERE product_id=%s",
                (params["id"],)
            )

            conn.commit()

            return response({"message": "Product deleted successfully"})


        return error_response("Unsupported method", 405)


    except Exception as e:

        print("ERROR:", str(e))
        return error_response("Internal server error: " + str(e), 500)


    finally:

        if cursor:
            try:
                cursor.close()
            except Exception:
                pass

        if conn:
            try:
                conn.close()
            except Exception:
                pass


# -----------------------
# RESPONSE FORMAT
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
        "body": json.dumps({"error": message}, cls=DecimalEncoder)
    }