import json
import decimal
from database.db import get_connection
from datetime import date, datetime, time


class DecimalEncoder(json.JSONEncoder):
    def default(self,o):
        if isinstance(o,decimal.Decimal):
            return float(o)
        if isinstance(o,(datetime,date,time)):
            return o.isoformat()
        return super().default(o)


def lambda_handler(event,context):

    conn=None

    try:

        method=event["httpMethod"]
        params=event.get("queryStringParameters") or {}

        conn=get_connection()
        cursor=conn.cursor()

        # GET
        if method=="GET":

            if params.get("id"):

                cursor.execute(
                    "SELECT * FROM taxes WHERE tax_id=%s",
                    (params["id"],)
                )

                data=cursor.fetchone()

            else:

                cursor.execute("SELECT * FROM taxes")
                data=cursor.fetchall()

            return response(data)

        # POST
        if method=="POST":

            body=json.loads(event["body"])

            if "tax_name" not in body:
                return error_response("tax_name required",400)

            cursor.execute(
                """
                INSERT INTO taxes
                (tax_name,tax_percentage,status)
                VALUES (%s,%s,%s)
                """,
                (
                    body["tax_name"],
                    body.get("tax_percentage",0),
                    body.get("status",1)
                )
            )

            conn.commit()

            return response({"message":"Tax created successfully"})


        # PUT
        if method=="PUT":

            body=json.loads(event["body"])

            cursor.execute(
                """
                UPDATE taxes
                SET tax_name=%s,
                    tax_percentage=%s,
                    status=%s
                WHERE tax_id=%s
                """,
                (
                    body["tax_name"],
                    body.get("tax_percentage",0),
                    body.get("status",1),
                    params["id"]
                )
            )

            conn.commit()

            return response({"message":"Tax updated successfully"})


        # DELETE
        if method=="DELETE":

            cursor.execute(
                "DELETE FROM taxes WHERE tax_id=%s",
                (params["id"],)
            )

            conn.commit()

            return response({"message":"Tax deleted successfully"})


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