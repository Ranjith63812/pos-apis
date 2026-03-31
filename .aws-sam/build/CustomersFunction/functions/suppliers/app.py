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
                    "SELECT * FROM suppliers WHERE supplier_id=%s",
                    (params["id"],)
                )

                data = cursor.fetchone()

            else:

                cursor.execute("SELECT * FROM suppliers")
                data = cursor.fetchall()

            return response(data)


        # -----------------------
        # POST
        # -----------------------
        if method == "POST":

            if not event.get("body"):
                return error_response("Request body is required", 400)

            body = json.loads(event["body"])

            if "supplier_name" not in body:
                return error_response("supplier_name is required", 400)

            cursor.execute(
                """
                INSERT INTO suppliers
                (supplier_name, mobile, email, tax_number, country_id, state_id,
                city, postcode, address, opening_balance, status)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    body["supplier_name"],
                    body.get("mobile"),
                    body.get("email"),
                    body.get("tax_number"),
                    body.get("country_id"),
                    body.get("state_id"),
                    body.get("city"),
                    body.get("postcode"),
                    body.get("address"),
                    body.get("opening_balance", 0),
                    body.get("status", 1)
                )
            )

            conn.commit()

            return response({"message": "Supplier created successfully"})


        # -----------------------
        # PUT
        # -----------------------
        if method == "PUT":

            if not params.get("id"):
                return error_response("Supplier id required", 400)

            if not event.get("body"):
                return error_response("Request body is required", 400)

            body = json.loads(event["body"])

            if "supplier_name" not in body:
                return error_response("supplier_name is required", 400)

            cursor.execute(
                """
                UPDATE suppliers
                SET supplier_name=%s, mobile=%s, email=%s, tax_number=%s,
                country_id=%s, state_id=%s, city=%s, postcode=%s,
                address=%s, opening_balance=%s, status=%s
                WHERE supplier_id=%s
                """,
                (
                    body["supplier_name"],
                    body.get("mobile"),
                    body.get("email"),
                    body.get("tax_number"),
                    body.get("country_id"),
                    body.get("state_id"),
                    body.get("city"),
                    body.get("postcode"),
                    body.get("address"),
                    body.get("opening_balance", 0),
                    body.get("status", 1),
                    params["id"]
                )
            )

            conn.commit()

            return response({"message": "Supplier updated successfully"})


        # -----------------------
        # DELETE
        # -----------------------
        if method == "DELETE":

            if not params.get("id"):
                return error_response("Supplier id required", 400)

            cursor.execute(
                "DELETE FROM suppliers WHERE supplier_id=%s",
                (params["id"],)
            )

            conn.commit()

            return response({"message": "Supplier deleted successfully"})


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