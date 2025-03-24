from fastapi import APIRouter, HTTPException, Query
import logging
import json
import subprocess
from pydantic import BaseModel
from ..database.db import connect_db, execute_query
from ..execution import safe_execute_script, execute_script_from_db

router = APIRouter()

#= ROOT ==================================================================================================
@router.get("/")  # Define a route for "/"
def read_root():
    return {"message": "Welcome to MISA API"}

#= USER ==================================================================================================
# Store user data in database
@router.post("/generate_user")
async def generate_user(data: dict):
    """
    Receives input from the frontend, stores it in the database, and returns the results.
    """
    logging.info(f"Received data: {data}")
    try:
        query = """INSERT INTO Users (uuid) VALUES (%s)"""
        execute_query(query, (data["uuid"],))
        return {"success": True, "message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/get_user/{uuid}")
async def get_user(uuid: str):
    """
    Retrieves user data from the database based on the UUID.
    """
    try:
        query = """SELECT user_id, uuid, created_on FROM Users WHERE uuid = %s"""
        user_data = execute_query(query, (uuid,), fetch_one=True, dictionary=True)

        if user_data:
            logging.info(f"🔍 User data fetched: {user_data}")
            return {"success": True, "user_data": user_data}
        else:
            logging.warning("❌ User not found in database.")
            raise HTTPException(status_code=404, detail="User not found")

    except Exception as e:
        logging.error(f"❌ Error retrieving user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))        

#= FACTS ==================================================================================================
class UserFacts(BaseModel):
    father: int
    mother: int
    brothers: int
    sisters: int
    husband: int
    wife: int
    sons: int
    daughters: int
    grandsons: int
    granddaughters: int
    paternal_grandfather: int
    paternal_grandmother: int
    maternal_grandfather: int
    maternal_grandmother: int
    will_amount: float
    networth: float

@router.post("/store_details")
async def store_details(data: dict):
    """
    Receives input from the frontend, checks for duplicate Users_user_id, and updates the record if it exists.
    """
    try:
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
        execute_query(query, (
            data["father"], data["mother"], data["brothers"], data["sisters"], 
            data["husband"], data["wife"], data["sons"], data["daughters"], 
            data["grandsons"], data["granddaughters"], data["Users_user_id"],
            data["paternal_grandfather"], data["paternal_grandmother"],
            data["maternal_grandfather"], data["maternal_grandmother"],
            data["will_amount"], data["networth"]
        ))

        logging.info("✅ Data stored/updated successfully!")
        return {"success": True, "message": "Data stored/updated successfully"}

    except Exception as e:
        logging.error(f"❌ Error storing/updating data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/get_facts/{Users_user_id}")
async def get_facts(Users_user_id: int):
    """
    Retrieves facts from the db based on user_id fk.
    """
    try:
        query = """SELECT * FROM Facts WHERE Users_user_id = %s"""
        user_facts = execute_query(query, (Users_user_id,), fetch_one=True, dictionary=True)

        if user_facts:
            logging.info(f"🔍 User facts fetched: {user_facts}")
            return {"success": True, "user_facts": user_facts}
        else:
            logging.warning("❌ Facts not found in database.")
            raise HTTPException(status_code=404, detail="Facts not found")

    except Exception as e:
        logging.error(f"❌ Error retrieving user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))   
    
@router.get("/get_facts_id/{Users_user_id}")
async def get_facts_id(Users_user_id: int):
    """
    Retrieves facts from the db based on user_id fk.
    """ 
    try:
        query = """SELECT facts_id FROM Facts WHERE Users_user_id = %s"""
        factid = execute_query(query, (Users_user_id,), fetch_one=True, dictionary=True)

        if factid:
            logging.info(f"🔍 User facts fetched: {factid}")
            return {"success": True, "Fact ID": factid}
        else:
            logging.warning("❌ Facts not found in database.")
            raise HTTPException(status_code=404, detail="Facts not found")

    except Exception as e:
        logging.error(f"❌ Error retrieving user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))     
    
@router.put("/update_facts/{user_id}")
async def update_facts(user_id: int, facts: UserFacts):
    try:
        # Check if User Facts Exist
        query = "SELECT * FROM facts WHERE Users_user_id = %s"
        existing_facts = execute_query(query, (user_id,), fetch_one=True, dictionary=True)

        if not existing_facts:
            raise HTTPException(status_code=404, detail="User facts not found")

        # Update Facts in Database
        query = """
        UPDATE facts SET father=%s, mother=%s, brothers=%s, sisters=%s, 
        husband=%s, wife=%s, sons=%s, daughters=%s, grandsons=%s, 
        granddaughters=%s, paternal_grandfather=%s, paternal_grandmother=%s,
        maternal_grandfather=%s, maternal_grandmother=%s, will_amount=%s, 
        networth=%s WHERE Users_user_id=%s
        """
        values = (
            facts.father, facts.mother, facts.brothers, facts.sisters,
            facts.husband, facts.wife, facts.sons, facts.daughters, 
            facts.grandsons, facts.granddaughters, facts.paternal_grandfather, 
            facts.paternal_grandmother, facts.maternal_grandfather, 
            facts.maternal_grandmother, facts.will_amount, facts.networth, user_id
        )

        execute_query(query, values)

        # Retrieve and Return Updated Facts
        query = "SELECT * FROM facts WHERE Users_user_id = %s"
        updated_facts = execute_query(query, (user_id,), fetch_one=True, dictionary=True)

        logging.info(f"Updated facts for user {user_id}: {updated_facts}")
        return {"success": True, "updatedFacts": updated_facts}

    except Exception as e:
        logging.error(f"Error updating facts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

#= INHERITANCE ===========================================================================================
     
@router.post("/run_inheritance")
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

@router.get("/get_system")
async def get_system(system_name: str = Query(..., title="System Name")):
    """
    Retrieves the inheritance system details based on system_name (using query parameters).
    """
    try:
        logging.info(f"Fetching system details for: {system_name}")

        query = "SELECT idInheritanceSystem, system_name FROM InheritanceSystem WHERE system_name = %s"
        system_data = execute_query(query, (system_name,), fetch_one=True, dictionary=True)

        if not system_data:
            logging.warning(f"System '{system_name}' not found in database.")
            raise HTTPException(status_code=404, detail="System not found")

        logging.info(f"System details found: {system_data}")
        return {"success": True, "system": system_data}

    except Exception as e:
        logging.error(f"Error retrieving system: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving system: {str(e)}")
       
@router.post("/share_inheritance")
async def share_inheritance(data: dict):
    """
    Runs an inheritance script stored in the database based on system_name.
    """
    try:
        user_id = data.get("user_id")
        system_name = data.get("system_name")
        logging.info(f"Running inheritance script for user {user_id} using system: {system_name}")
        if not user_id:
            raise HTTPException(status_code=400, detail="Missing user_id")

        # Execute the script stored in the database
        json_result, results_for_db, context_info = safe_execute_script(user_id, system_name)

        # Ensure `json_result` and `results_for_db` are correctly formatted
        if isinstance(json_result, dict):  # If already a dictionary, convert it properly
            json_result = json.dumps(json_result, ensure_ascii=False)

        if isinstance(results_for_db, dict): 
            detailed_result = json.dumps(results_for_db, ensure_ascii=False)
        else:
            detailed_result = results_for_db  # In case it's already a JSON string

        # Store results in the db
        query = """
        INSERT INTO InheritanceResults (name, json_result, detailed_result, InheritanceSystem_idInheritanceSystem, Facts_id, Users_user_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
        json_result = VALUES(json_result),
        detailed_result = VALUES(detailed_result);
        """    
        values = (system_name, json_result, detailed_result, data.get("InheritanceSystem_id"), data.get("Facts_id"), user_id)
        logging.info(f"Values: {values}")
        execute_query(query, values)

        return {
            "success": True,
            "json_result": json.loads(json_result),
            "results_for_db": results_for_db,
            "context_info": context_info
        }

    except Exception as e:
        logging.error(f"❌ Error in share_inheritance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/get_all_results/{Users_user_id}")
async def get_all_results(Users_user_id: int):
    """
    Retrieve all inheritance results for the user from the database.
    """
    try:
        query = """SELECT * FROM InheritanceResults WHERE Users_user_id = %s"""
        results = execute_query(query, (Users_user_id,), fetch_all=True, dictionary=True)

        if not results:
            raise HTTPException(status_code=404, detail="No results found for this user")

        return {"success": True, "results": results}

    except Exception as e:
        logging.error(f"❌ Error retrieving results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list_systems")
async def list_systems():
    """List all available inheritance systems in the database."""
    try:
        query = "SELECT idInheritanceSystem, system_name FROM InheritanceSystem"
        systems = execute_query(query, fetch_all=True, dictionary=True)
        
        if systems:
            return {"success": True, "systems": systems}
        else:
            return {"success": False, "message": "No inheritance systems found"}
    except Exception as e:
        logging.error(f"Error listing inheritance systems: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 