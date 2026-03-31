import os
import pymysql

def get_connection():

    connection = pymysql.connect(
        host=os.environ["DB_HOST"],
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        database=os.environ["DB_NAME"],
        port=int(os.environ["DB_PORT"]),
        cursorclass=pymysql.cursors.DictCursor
    )

    return connection