from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import json
import mysql.connector
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)


# Using FastAPI 
app = FastAPI()

# Enable CORS (Allow React frontend to access FastAPI)
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:3000"],  # Adjust if needed
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
# Localhost
def connect_db():
    try:
        connection = mysql.connector.connect(
            host="127.0.0.1",
            user="root",
            password="!fg121u03",
            database="misa_db"
        )
        logging.info("Database connection successful")
        return connection
    except mysql.connector.Error as err:
        logging.error(f"Error: {err}")
        raise HTTPException(status_code=500, detail=f"Database connection failed. {err}")
    # connection = mysql.connector.connect(
    #     host="127.0.0.1",
    #     user="root",
    #     password="!fg121u03",
    #     database = "misa_db"
    # )
    # return connection

# Store user data in database
@app.post("/generate_user")
async def generate_user(data: dict):
    """
    Receives input from the frontend, stores it in the database, and returns the results.
    """
    logging.info(f"Received data: {data}")
    try:
        connection = connect_db()
        cursor = connection.cursor()

        query = """INSERT INTO Users (uuid) VALUES (%s)"""
        cursor.execute(query, (data["uuid"],))
        connection.commit()
        connection.close()
        return {"success": True, "message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Retrieve user data from database
# @app.get("/get_user/{uuid}")
# async def get_user(uuid: str):
#     """
#     Retrieves user data from the database and returns the results.
#     """
#     try:
#         connection = connect_db()
#         cursor = connection.cursor(dictionary=True)
#         query = "SELECT * FROM users WHERE uuid = %s"
#         cursor.execute(query, (uuid,))
#         user_data = cursor.fetchone()
#         connection.close()
#         if not user_data:
#             logging.info("User not found")
#             raise HTTPException(status_code=404, detail="User not found")
#         logging.info(f"User found: {user_data}")
#         return {"success": True, "data": { "UserID": user_data[0] ,"uuid": user_data[1]}}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
@app.get("/get_user/{uuid}")
async def get_user(uuid: str):
    """
    Retrieves user data from the database based on the UUID.
    """
    try:
        connection = connect_db()
        cursor = connection.cursor(dictionary=True)  # ✅ Ensures dict format
        query = """SELECT user_id, uuid, created_on FROM users WHERE uuid = %s"""
        cursor.execute(query, (uuid,))
        user_data = cursor.fetchone()
        cursor.close()
        connection.close()

        if user_data:
            logging.info(f"🔍 User data fetched: {user_data}")
            return {"success": True, "user_data": user_data}  # ✅ Ensure correct response format
        else:
            logging.warning("❌ User not found in database.")
            raise HTTPException(status_code=404, detail="User not found")

    except Exception as e:
        logging.error(f"❌ Error retrieving user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))        


# Store beneficiary data in database
# @app.post("/store_details")
# async def store_details(data: dict):
#     """
#     Receives input from the frontend, stores it in the database, and returns the results.
#     """
#     try:
#         connection = connect_db()
#         cursor = connection.cursor()

#         logging.info(f"Received data: {data}")
#         if "Users_user_id" not in data or data["Users_user_id"] is None:
#             logging.error("❌ Error: Users_user_id is missing or None!")
#             raise HTTPException(status_code=400, detail="Users_user_id is required.")
#         if "networth" not in data or data["networth"] is None:
#             logging.error("❌ Error: networth is missing or None!")
#             raise HTTPException(status_code=400, detail="networth is required.")
        
#         query1 =""" 
#         INSERT INTO Facts 
#         (father, mother, brothers, sisters, husband, wife, sons, daughters, grandsons, granddaughters,
#           Users_user_id, paternal_grandfather, paternal_grandmother,maternal_grandfather,
#           maternal_grandmother,will_amount,networth)
#         VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s)"""

#         # 
#         logging.info(f"Query: {query1}")
#         logging.info("Query values: %s", (data['father'], data['mother'], data['brothers'], data['sisters'], 
#                                   data['husband'], data['wife'], data['sons'], data['daughters'], 
#                                   data['grandsons'], data['granddaughters'], data['Users_user_id'],
#                                   data['networth'],data['will_amount'],data['paternal_grandfather'],data['paternal_grandmother']
#                                   ,data['maternal_grandfather'],data['maternal_grandmother']))

#         # Insert beneficiary data into the database
#         cursor.execute(query1, (data["father"], data["mother"], data["brothers"], data["sisters"], 
#                                data["husband"], data["wife"], data["sons"], data["daughters"], 
#                                data["grandsons"], data["granddaughters"], data["Users_user_id"],
#                                data['networth'],data['will_amount'],data['paternal_grandfather'],data['paternal_grandmother']
#                                   ,data['maternal_grandfather'],data['maternal_grandmother']))
        
#         # get the last inserted id for beneficiary
#         # beneficiary_id = cursor.lastrowid

#         #Insert Financial data into the database
#         # query2 = """
#         # INSERT INTO finances
#         # (Users_user_id,networth,will_amount)
#         # VALUES (%s, %s, %s)
#         # """

#         # # 
#         # logging.info(f"Executing Financial Data Query: {query2}")
#         # logging.info(f"Query Values: {(data['Users_user_id'], data['networth'], data['will_amount'])}")


#         # cursor.execute(query2, (data["Users_user_id"], data["networth"], data["will_amount"]))

#         connection.commit()
#         connection.close()
#         logging.info("Data stored successfully into table")
#         return {"success": True, "message": "Data stored successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
@app.post("/store_details")
async def store_details(data: dict):
    """
    Receives input from the frontend, checks for duplicate Users_user_id, and updates the record if it exists.
    """
    try:
        connection = connect_db()
        cursor = connection.cursor()

        logging.info(f"Received data: {data}")
        
        # Ensure required fields exist
        if "Users_user_id" not in data or data["Users_user_id"] is None:
            logging.error("❌ Error: Users_user_id is missing or None!")
            raise HTTPException(status_code=400, detail="Users_user_id is required.")
        if "networth" not in data or data["networth"] is None:
            logging.error("❌ Error: networth is missing or None!")
            raise HTTPException(status_code=400, detail="networth is required.")
        
        # SQL Query to insert OR update existing user data
        query = """ 
        INSERT INTO Facts 
        (father, mother, brothers, sisters, husband, wife, sons, daughters, grandsons, granddaughters,
         Users_user_id, paternal_grandfather, paternal_grandmother, maternal_grandfather,
         maternal_grandmother, will_amount, networth)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        father = VALUES(father), 
        mother = VALUES(mother), 
        brothers = VALUES(brothers), 
        sisters = VALUES(sisters),
        husband = VALUES(husband), 
        wife = VALUES(wife), 
        sons = VALUES(sons), 
        daughters = VALUES(daughters),
        grandsons = VALUES(grandsons), 
        granddaughters = VALUES(granddaughters), 
        paternal_grandfather = VALUES(paternal_grandfather),
        paternal_grandmother = VALUES(paternal_grandmother), 
        maternal_grandfather = VALUES(maternal_grandfather),
        maternal_grandmother = VALUES(maternal_grandmother), 
        will_amount = VALUES(will_amount), 
        networth = VALUES(networth)
        """

        logging.info(f"Query: {query}")
        logging.info("Query values: %s", (data['father'], data['mother'], data['brothers'], data['sisters'], 
                                  data['husband'], data['wife'], data['sons'], data['daughters'], 
                                  data['grandsons'], data['granddaughters'], data['Users_user_id'],
                                  data['paternal_grandfather'], data['paternal_grandmother'],
                                  data['maternal_grandfather'], data['maternal_grandmother'],
                                  data['will_amount'], data['networth']))

        # Insert or update data in the database
        cursor.execute(query, (
            data["father"], data["mother"], data["brothers"], data["sisters"], 
            data["husband"], data["wife"], data["sons"], data["daughters"], 
            data["grandsons"], data["granddaughters"], data["Users_user_id"],
            data["paternal_grandfather"], data["paternal_grandmother"],
            data["maternal_grandfather"], data["maternal_grandmother"],
            data["will_amount"], data["networth"]
        ))

        connection.commit()
        connection.close()
        logging.info("✅ Data stored/updated successfully!")
        return {"success": True, "message": "Data stored/updated successfully"}

    except Exception as e:
        logging.error(f"❌ Error storing/updating data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/get_facts/{Users_user_id}")
async def get_facts(Users_user_id: int):
    """
    Retrieves facts from the db based on user_id fk.
    """
    try:
        connection = connect_db()
        cursor = connection.cursor(dictionary=True)  # ✅ Ensures dict format
        query = """SELECT * FROM Facts WHERE Users_user_id = %s"""
        cursor.execute(query, (Users_user_id,))
        user_facts = cursor.fetchone()
        cursor.close()
        connection.close()

        if user_facts:
            logging.info(f"🔍 User facts fetched: {user_facts}")
            return {"success": True, "user_facts": user_facts}  # ✅ Ensure correct response format
        else:
            logging.warning("❌ Facts not found in database.")
            raise HTTPException(status_code=404, detail="Facts not found")

    except Exception as e:
        logging.error(f"❌ Error retrieving user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))   
     
@app.post("/run_inheritance")
async def run_inheritance(data: dict):
    """
    Receives input from the frontend, runs Islamic_RBS.py, and returns the results.
    """
    try:
        # Convert data to JSON string and pass it to the script
        result = subprocess.run(
            ["python3", "Islamic_RBS.py", json.dumps(data)],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise HTTPException(status_code=500, detail="Error running inheritance script")

        return {"success": True, "result": result.stdout.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#Fetch data from database

# Run the FastAPI app with Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001, reload=True)



#Using Flask

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import subprocess
# import json

# app = Flask(__name__)
# CORS(app)  # Enable CORS for frontend communication

# @app.route('/run_inheritance', methods=['POST'])
# def run_inheritance():
#     try:
#         # Get input data from frontend
#         data = request.json  
        
#         # Convert data to JSON string and pass it as an argument to the script
#         result = subprocess.run(
#             ["python", "Islamic_RBS.py", json.dumps(data)],
#             capture_output=True,
#             text=True
#         )
        
#         # Return script output to frontend
#         return jsonify({"success": True, "result": result.stdout.strip()})
    
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)})

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)