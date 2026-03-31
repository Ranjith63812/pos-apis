import pymysql
import sys

def check_delete(return_id):
    try:
        conn = pymysql.connect(
            host='kapni-db.cl6mgq2ichp6.ap-south-1.rds.amazonaws.com',
            user='admin',
            password='Ranjith123',
            database='inventory_pos',
            cursorclass=pymysql.cursors.DictCursor
        )
        cursor = conn.cursor()
        
        # We will try to execute the exact DELETEs we wrote in app.py
        print("Executing delete for sale_return_id=", return_id)
        
        print("1. DELETING payments...")
        cursor.execute("DELETE FROM sale_return_payments WHERE sale_return_id=%s", (return_id,))
        print("payments deleted")

        print("2. DELETING items...")
        cursor.execute("DELETE FROM sale_return_items WHERE sale_return_id=%s", (return_id,))
        print("items deleted")

        print("3. DELETING parent...")
        cursor.execute("DELETE FROM sale_returns WHERE sale_return_id=%s", (return_id,))
        print("parent deleted")
        
        conn.commit()
        print("SUCCESS")
    except Exception as e:
        print("ERROR:")
        print(str(e))
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_delete(sys.argv[1])
    else:
        print("Please provide an ID")
