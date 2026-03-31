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

        # GET
        if method == "GET":

            if params.get("id"):

                cursor.execute(
                    "SELECT * FROM brands WHERE brand_id=%s",
                    (params["id"],)
                )

                data = cursor.fetchone()

            else:

                cursor.execute("SELECT * FROM brands")
                data = cursor.fetchall()

            return response(data)

        # POST
        if method == "POST":

            body = json.loads(event["body"])

            if "brand_name" not in body:
                return error_response("brand_name is required", 400)

            cursor.execute(
                """
                INSERT INTO brands
                (brand_code,brand_name,description,status)
                VALUES (%s,%s,%s,%s)
                """,
                (
                    body.get("brand_code"),
                    body["brand_name"],
                    body.get("description"),
                    body.get("status",1)
                )
            )

            conn.commit()

            return response({"message":"Brand created successfully"})


        # PUT
        if method == "PUT":

            body = json.loads(event["body"])

            if not params.get("id"):
                return error_response("brand id required",400)

            cursor.execute(
                """
                UPDATE brands
                SET brand_code=%s,
                    brand_name=%s,
                    description=%s,
                    status=%s
                WHERE brand_id=%s
                """,
                (
                    body.get("brand_code"),
                    body["brand_name"],
                    body.get("description"),
                    body.get("status",1),
                    params["id"]
                )
            )

            conn.commit()

            return response({"message":"Brand updated successfully"})


        # DELETE
        if method == "DELETE":

            if not params.get("id"):
                return error_response("brand id required",400)

            cursor.execute(
                "DELETE FROM brands WHERE brand_id=%s",
                (params["id"],)
            )

            conn.commit()

            return response({"message":"Brand deleted successfully"})


    except Exception as e:
        return error_response(str(e))

    finally:
        if conn:
            conn.close()


def response(data):

    return {
        "statusCode":200,
        "headers":{
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
        },
        "body":json.dumps(data,cls=DecimalEncoder)
    }


def error_response(message,code=500):

    return {
        "statusCode":code,
        "headers":{
            "Content-Type":"application/json",
            "Access-Control-Allow-Origin":"*"
        },
        "body":json.dumps({"error":message})
    }