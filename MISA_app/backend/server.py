from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import json
import mysql.connector
import logging
import sys
import os

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


#---------------------------------------------------------------------------------------------------------
# HELPER FUNCTIONS
#--------------------------------------------------------------------------------------------------------
def get_script_from_db(system_name):
    """Fetch the Python script from the database based on system_name."""
    connection = connect_db()
    cursor = connection.cursor()

    try:
        query = "SELECT system_script FROM InheritanceSystem WHERE system_name = %s"
        cursor.execute(query, (system_name,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()

        if result and result[0]:
            logging.info(f"✅ Retrieved script for {system_name}: {result[0][:100]}...") 
            return result[0]  # The script content
        else:
            logging.warning(f"❌ No script found for system: {system_name}")
            raise Exception(f"No script found for system: {system_name}")

    except mysql.connector.Error as err:
        logging.error(f"❌ Error fetching script: {err}")
        raise Exception(f"Error fetching script: {err}")

def execute_script_from_db(user_id, system_name):
    """Fetch and execute the inheritance script for the given user."""
    try:
        # Retrieve the script from the database
        script_content = get_script_from_db(system_name)
        # logging.info("Script Content:",script_content)

        # Write script to a temporary file
        script_filename = f"temp_{system_name.replace(' ', '_')}.py"
        with open(script_filename, "w", encoding="utf-8") as script_file:
            script_file.write(script_content)

        # Execute the script and pass the user_id as an argument
        # result = subprocess.run(
        #     ["python3", script_filename, str(user_id)],
        #     capture_output=True,
        #     text=True
        # )
        result = subprocess.run(
            [sys.executable, script_filename, str(user_id)],  # ✅ Works on all OS
            capture_output=True,text=True
            )
        
        # logging.error(f"🔴 Script execution failed: {result.stderr.strip()}")  # ✅ Log error details


        # Cleanup: Remove the temporary script file
        os.remove(script_filename)

        if result.returncode != 0:
            raise Exception(f"Error executing script: {result.stderr}")
        
        output_data = json.loads(result.stdout.strip())

        json_result = output_data.get("json_result", "{}") 
        results_for_db = output_data.get("results_for_db", {})


        # return json.loads(result.stdout)  # Convert script output to JSON
        return json_result, results_for_db

    except Exception as e:
        raise Exception(f"Script execution failed: {str(e)}")

#---------------------------------------------------------------------------------------------------------
# API ROUTES
#--------------------------------------------------------------------------------------------------------

#= USER ==================================================================================================
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

#= FACTS ==================================================================================================

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

#= INHERITANCE ===========================================================================================
     
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
    
@app.post("/share_inheritance")
async def share_inheritance(data: dict):
    """
    Runs an inheritance script stored in the database based on system_name.
    """
    try:
        user_id = data.get("user_id")
        system_name = data.get("system_name", "Islamic Inheritance")  # Default to Islamic

        if not user_id:
            raise HTTPException(status_code=400, detail="Missing user_id")

        # Execute the script stored in the database
        json_result,results_for_db = execute_script_from_db(user_id, system_name)

        # Store results in the db
        connection = connect_db()
        cursor = connection.cursor()

        # json_result = json.dumps(results_for_db)
        detailed_result = json.dumps(results_for_db)

        query = """
        INSERT INTO InheritanceResults (name, json_result, detailed_result, InheritanceSystem_idInheritanceSystem, Facts_id, Users_user_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            json_result = VALUES(json_result),
            detailed_result = VALUES(detailed_result),
            
            Facts_id = VALUES(Facts_id)
        """
        # InheritanceSystem_idInheritanceSystem = VALUES(InheritanceSystem_idInheritanceSystem),
        values = (system_name, json_result, detailed_result, data.get("InheritanceSystem_id"), data.get("Facts_id"), user_id)

        cursor.execute(query, values)
        connection.commit()
        connection.close()


        return {"success": True,
                 "json_result": json.loads(json_result),
                 "results_for_db": results_for_db
                 }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/get_all_results/{Users_user_id}")
async def get_all_results(Users_user_id: int):
    """
    Retrieve all inheritance results for the user from the database.
    """
    try:
        connection = connect_db()
        cursor = connection.cursor(dictionary=True)  # ✅ Return results as dictionary

        query = """SELECT * FROM InheritanceResults WHERE Users_user_id = %s"""
        cursor.execute(query, (Users_user_id,))
        results = cursor.fetchall()  # ✅ Fetch all results for the user

        cursor.close()
        connection.close()

        if not results:
            raise HTTPException(status_code=404, detail="No results found for this user")

        return {"success": True, "results": results}

    except Exception as e:
        logging.error(f"❌ Error retrieving results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



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