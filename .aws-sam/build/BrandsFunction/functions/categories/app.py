import json
import decimal
from database.db import get_connection
from datetime import date, datetime, time


class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        if isinstance(o, (datetime, date, time)):
            return o.isoformat()
        return super().default(o)


def lambda_handler(event, context):

    conn = None

    try:
        method = event["httpMethod"]
        params = event.get("queryStringParameters") or {}

        conn = get_connection()
        cursor = conn.cursor()

        # -----------------------
        # GET
        # -----------------------

        if method == "GET":

            if params.get("id"):

                cursor.execute(
                    "SELECT * FROM categories WHERE category_id=%s",
                    (params["id"],)
                )

                data = cursor.fetchone()

            else:

                cursor.execute(
                    "SELECT * FROM categories"
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

            if "category_name" not in body:
                return error_response("category_name is required", 400)

            cursor.execute(
                """
                INSERT INTO categories
                (category_code, category_name, description, status)
                VALUES (%s,%s,%s,%s)
                """,
                (
                    body.get("category_code"),
                    body["category_name"],
                    body.get("description"),
                    body.get("status", 1)
                )
            )

            conn.commit()

            return response({"message": "Category created successfully"})

        # -----------------------
        # PUT
        # -----------------------

        if method == "PUT":

            if not params.get("id"):
                return error_response("Category id required", 400)

            if not event.get("body"):
                return error_response("Request body is required", 400)

            body = json.loads(event["body"])

            if "category_name" not in body:
                return error_response("category_name is required", 400)

            cursor.execute(
                """
                UPDATE categories
                SET category_code=%s,
                    category_name=%s,
                    description=%s,
                    status=%s
                WHERE category_id=%s
                """,
                (
                    body.get("category_code"),
                    body["category_name"],
                    body.get("description"),
                    body.get("status", 1),
                    params["id"]
                )
            )

            conn.commit()

            return response({"message": "Category updated successfully"})

        # -----------------------
        # DELETE
        # -----------------------

        if method == "DELETE":

            if not params.get("id"):
                return error_response("Category id required", 400)

            cursor.execute(
                "DELETE FROM categories WHERE category_id=%s",
                (params["id"],)
            )

            conn.commit()

            return response({"message": "Category deleted successfully"})

        return error_response("Unsupported method", 405)

    except Exception as e:
        print("ERROR:", str(e))
        return error_response("Internal server error: " + str(e), 500)

    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass


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
        "body": json.dumps({"error": message}, cls=DecimalEncoder)
    }