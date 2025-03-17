import mysql.connector
import logging
from fastapi import HTTPException

def connect_db():
    try:
        connection = mysql.connector.connect(
            # Command Line to Use :- mysql -u um2005 -D um2005 -h 132.145.18.222 -p
            host = "132.145.18.222",
            user = "um2005",
            password = "wnd4VKSANY3",
            database = "um2005"
        )
        logging.info("Database connection successful")
        return connection
    except mysql.connector.Error as err:
        logging.error(f"Error: {err}")
        raise HTTPException(status_code=500, detail=f"Database connection failed. {err}")

def execute_query(query, params=None, fetch_one=False, fetch_all=False, dictionary=False):
    """
    Execute a database query with parameters and return results based on options.
    
    Args:
        query (str): SQL query to execute
        params (tuple, optional): Parameters for the query
        fetch_one (bool): Whether to fetch one result
        fetch_all (bool): Whether to fetch all results
        dictionary (bool): Whether to return results as dictionaries
        
    Returns:
        Query results based on the specified options
    """
    connection = connect_db()
    cursor = connection.cursor(dictionary=dictionary)
    
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
            
        if fetch_one:
            result = cursor.fetchone()
        elif fetch_all:
            result = cursor.fetchall()
        else:
            connection.commit()
            result = {"affected_rows": cursor.rowcount}
            
        return result
    except mysql.connector.Error as err:
        logging.error(f"Query execution error: {err}")
        raise HTTPException(status_code=500, detail=f"Database query failed: {err}")
    finally:
        cursor.close()
        connection.close()

def get_script_from_db(system_name):
    """Fetch the Python script from the database based on system_name."""
    try:
        query = "SELECT system_script FROM InheritanceSystem WHERE system_name = %s"
        result = execute_query(query, (system_name,), fetch_one=True)

        if result and result[0]:
            logging.info(f"✅ Retrieved script for {system_name}: {result[0][:100]}...") 
            return result[0]  # The script content
        else:
            logging.warning(f"❌ No script found for system: {system_name}")
            raise Exception(f"No script found for system: {system_name}")

    except Exception as err:
        logging.error(f"❌ Error fetching script: {err}")
        raise Exception(f"Error fetching script: {err}")

def fetch_user_facts(user_id):
    """Fetch user facts from the database."""
    query = "SELECT * FROM Facts WHERE Users_user_id = %s"
    return execute_query(query, (user_id,), fetch_one=True, dictionary=True) 