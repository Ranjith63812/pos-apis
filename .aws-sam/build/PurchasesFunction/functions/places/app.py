import json
import decimal
from database.db import get_connection

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super().default(o)


def lambda_handler(event, context):

    path = event["path"]

    if path == "/countries":
        return handle_countries(event)

    if path == "/states":
        return handle_states(event)

    return response({"message": "Invalid route"})


# ----------------------------------
# COUNTRIES CRUD
# ----------------------------------

def handle_countries(event):

    conn = get_connection()
    cursor = conn.cursor()

    method = event["httpMethod"]
    params = event.get("queryStringParameters") or {}

    # GET
    if method == "GET":

        if params.get("id"):

            cursor.execute(
                "SELECT * FROM countries WHERE country_id=%s",
                (params["id"],)
            )

            data = cursor.fetchone()

        else:

            cursor.execute("SELECT * FROM countries")
            data = cursor.fetchall()

        return response(data)

    # POST
    if method == "POST":

        body = json.loads(event["body"])

        cursor.execute(
            "INSERT INTO countries (country_name,status) VALUES (%s,%s)",
            (body["country_name"], body.get("status", 1))
        )

        conn.commit()

        return response({"message": "Country created successfully"})

    # PUT
    if method == "PUT":

        if not params.get("id"):
            return response({"message": "Country id required"})

        body = json.loads(event["body"])

        cursor.execute(
            "UPDATE countries SET country_name=%s,status=%s WHERE country_id=%s",
            (
                body["country_name"],
                body.get("status", 1),
                params["id"]
            )
        )

        conn.commit()

        return response({"message": "Country updated successfully"})

    # DELETE
    if method == "DELETE":

        if not params.get("id"):
            return response({"message": "Country id required"})

        cursor.execute(
            "DELETE FROM countries WHERE country_id=%s",
            (params["id"],)
        )

        conn.commit()

        return response({"message": "Country deleted successfully"})


# ----------------------------------
# STATES CRUD
# ----------------------------------

def handle_states(event):

    conn = get_connection()
    cursor = conn.cursor()

    method = event["httpMethod"]
    params = event.get("queryStringParameters") or {}

    # GET
    if method == "GET":

        if params.get("id"):

            cursor.execute(
                """
                SELECT s.state_id,s.state_name,c.country_name
                FROM states s
                JOIN countries c
                ON s.country_id = c.country_id
                WHERE s.state_id=%s
                """,
                (params["id"],)
            )

            data = cursor.fetchone()

        else:

            cursor.execute(
                """
                SELECT s.state_id,s.state_name,c.country_name
                FROM states s
                JOIN countries c
                ON s.country_id = c.country_id
                """
            )

            data = cursor.fetchall()

        return response(data)

    # POST
    if method == "POST":

        body = json.loads(event["body"])

        cursor.execute(
            "INSERT INTO states (state_name,country_id,status) VALUES (%s,%s,%s)",
            (body["state_name"], body["country_id"], body.get("status", 1))
        )

        conn.commit()

        return response({"message": "State created successfully"})

    # PUT
    if method == "PUT":

        if not params.get("id"):
            return response({"message": "State id required"})

        body = json.loads(event["body"])

        cursor.execute(
            """
            UPDATE states
            SET state_name=%s,country_id=%s,status=%s
            WHERE state_id=%s
            """,
            (
                body["state_name"],
                body["country_id"],
                body.get("status", 1),
                params["id"]
            )
        )

        conn.commit()

        return response({"message": "State updated successfully"})

    # DELETE
    if method == "DELETE":

        if not params.get("id"):
            return response({"message": "State id required"})

        cursor.execute(
            "DELETE FROM states WHERE state_id=%s",
            (params["id"],)
        )

        conn.commit()

        return response({"message": "State deleted successfully"})


# ----------------------------------
# RESPONSE FORMAT
# ----------------------------------

def response(data):

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(data, cls=DecimalEncoder)
    }