import json
import decimal
from datetime import datetime, date
from database.db import get_connection


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)


def lambda_handler(event, context):

    conn = None
    cursor = None

    try:
        method = event.get("httpMethod")
        params = event.get("queryStringParameters") or {}

        conn = get_connection()
        cursor = conn.cursor()

        # -----------------------
        # GET (LIST + SINGLE)
        # -----------------------
        if method == "GET":

            if params.get("id"):
                cursor.execute("""
                    SELECT 
                        e.*,
                        ec.category_name
                    FROM expenses e
                    LEFT JOIN expense_categories ec 
                        ON e.category_id = ec.category_id
                    WHERE e.expense_id = %s
                """, (params["id"],))

                data = cursor.fetchone()
                return response(data)

            else:
                cursor.execute("""
                    SELECT 
                        e.expense_id,
                        DATE_FORMAT(e.expense_date, '%d-%m-%Y') AS expense_date,
                        ec.category_name,
                        e.reference_no,
                        e.expense_for,
                        e.amount,
                        e.note,
                        e.created_by
                    FROM expenses e
                    LEFT JOIN expense_categories ec 
                        ON e.category_id = ec.category_id
                    ORDER BY e.expense_id DESC
                """)

                data = cursor.fetchall()

                # 🔥 TOTAL CALCULATION
                cursor.execute("SELECT SUM(amount) AS total FROM expenses")
                total = cursor.fetchone()["total"] or 0

                return response({
                    "expenses": data,
                    "total": total
                })

        # -----------------------
        # POST
        # -----------------------
        if method == "POST":

            body = json.loads(event["body"])

            cursor.execute("""
                INSERT INTO expenses
                (expense_date, category_id, reference_no,
                 expense_for, amount, note, created_by)
                VALUES (%s,%s,%s,%s,%s,%s,%s)
            """, (
                body.get("expense_date"),
                body.get("category_id"),
                body.get("reference_no"),
                body.get("expense_for"),
                body.get("amount"),
                body.get("note"),
                body.get("created_by", 1)
            ))

            conn.commit()

            return response({"message": "Expense created successfully"})

        # -----------------------
        # PUT
        # -----------------------
        if method == "PUT":

            if not params.get("id"):
                return error_response("Expense ID required", 400)

            body = json.loads(event["body"])

            cursor.execute("""
                UPDATE expenses
                SET expense_date=%s,
                    category_id=%s,
                    reference_no=%s,
                    expense_for=%s,
                    amount=%s,
                    note=%s
                WHERE expense_id=%s
            """, (
                body.get("expense_date"),
                body.get("category_id"),
                body.get("reference_no"),
                body.get("expense_for"),
                body.get("amount"),
                body.get("note"),
                params["id"]
            ))

            conn.commit()

            return response({"message": "Expense updated successfully"})

        # -----------------------
        # DELETE
        # -----------------------
        if method == "DELETE":

            if not params.get("id"):
                return error_response("Expense ID required", 400)

            cursor.execute(
                "DELETE FROM expenses WHERE expense_id=%s",
                (params["id"],)
            )

            conn.commit()

            return response({"message": "Expense deleted successfully"})

        return error_response("Unsupported method", 405)

    except Exception as e:
        print("ERROR:", str(e))
        return error_response(str(e), 500)

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


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