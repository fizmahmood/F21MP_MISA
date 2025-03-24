import logging
import json
import os
import sys
import subprocess
import traceback
import types
# from app.database.db import get_script_from_db, fetch_user_facts
from .database.db import get_script_from_db, fetch_user_facts

def execute_script_from_db(user_id, system_name):
    """Fetch and execute the inheritance script for the given user."""
    try:
        # Retrieve the script from the database
        script_content = get_script_from_db(system_name)

        # ======================================================
        script_filename = "/tmp/inheritance_script.py"

        # Ensure script directory exists
        os.makedirs(os.path.dirname(script_filename), exist_ok=True)

        with open(script_filename, "w", encoding="utf-8") as script_file:
            script_file.write(script_content)  # Your script content from DB

        logging.info(f"🟢 Step: Script successfully written to {script_filename}")

        # Make script executable (Linux/MacOS only)
        os.chmod(script_filename, 0o755)

        # Execute the script and pass the user_id as an argument
        logging.info(f"🟢 Step 4: Executing script '{script_filename}' with user_id {user_id}")

        result = subprocess.run(["python3", script_filename], capture_output=True, text=True)
        logging.info(f"📜 STDOUT: {result.stdout.strip()}")
        logging.error(f"🚨 STDERR: {result.stderr.strip()}")  # Capture detailed error

        logging.info(f"🟢 Step 5: Script execution completed.")

        # Cleanup: Remove the temporary script file
        os.remove(script_filename)

        if result.returncode != 0:
            logging.error(f"❌ Script execution failed: {result.stderr.strip()}")
            raise Exception(f"Error executing script: {result.stderr}")
        
        logging.info(f"📜 STDOUT: {result.stdout.strip()}")
        logging.error(f"🚨 STDERR: {result.stderr.strip()}")

        logging.info(f"✅ Script execution output: {result.stdout.strip()}")
        output_data = json.loads(result.stdout.strip())

        json_result = output_data.get("json_result", "{}") 
        results_for_db = output_data.get("results_for_db", {})
        context_info = output_data.get("context_info", {})

        return json_result, results_for_db, context_info

    except Exception as e:
        logging.error(f"❌ Script execution failed: {str(e)}")
        raise Exception(f"Script execution failed: {str(e)}")

def safe_execute_script(user_id, system_name):
    """Safely fetch and execute the inheritance script for the given user."""
    
    # ✅ Fetch user facts from database
    user_facts = fetch_user_facts(user_id)
    if not user_facts:
        return json.dumps({"error": f"No user facts found for user {user_id}"}), {}, {}

    try:
        # Retrieve the script from the database
        script_content = get_script_from_db(system_name)

        # ✅ Allow only essential built-ins (restrict dangerous ones)
        allowed_builtins = {
            "print": print,
            "json": json,
            "len": len,
            "range": range,
            "sum": sum,
            "int": int,
            "float": float,
            "abs": abs,
            "__import__": __import__,
            "__build_class__": __build_class__,
            "dict": dict,
            "setattr": setattr,  
            "getattr": getattr,  
            "isinstance": isinstance,  
            "issubclass": issubclass,  
            "super": super,
            "map": map,
            "filter": filter,
            "zip": zip,
            "vars": vars
        }

        # ✅ Safe execution namespace (allows necessary imports)
        safe_globals = {
            "__builtins__": allowed_builtins,  
            "json_result": "{}",  # Default output
            "user_id": user_id,
            "user_facts": user_facts,
            "results_for_db": {},
            "context_info": ""
        }

        # ✅ Define a safe `exec` wrapper
        exec_env = types.ModuleType("exec_env")
        exec_env.__dict__.update(safe_globals)

        logging.info(f"🔍 Running script for user {user_id} in a restricted execution environment.")

        # ✅ Execute script in a limited namespace
        exec(script_content, exec_env.__dict__)

        # ✅ Ensure JSON output is valid
        json_result = exec_env.__dict__.get("json_result", "{}")
        results_for_db = exec_env.__dict__.get("results_for_db", {})
        context_info = exec_env.__dict__.get("context_info", "")

        if isinstance(json_result, dict):
            json_result = json.dumps(json_result, ensure_ascii=False)

        return json_result, results_for_db, context_info

    except Exception as e:
        logging.error(f"❌ Script execution failed: {str(e)}\n{traceback.format_exc()}")
        raise Exception(f"Script execution failed: {str(e)}") 

def get_script_from_db(system_name):
    """Retrieve the script content from the database based on system name."""
    query = """
        SELECT script_content FROM InheritanceScripts 
        WHERE InheritanceSystem_idInheritanceSystem = (
            SELECT idInheritanceSystem FROM InheritanceSystem 
            WHERE system_name = %s
        )
    """
    result = execute_query(query, (system_name,), fetch_one=True)
    if not result:
        # Add more detailed logging here
        logging.error(f"No script found for system: {system_name}")
        raise Exception(f"No script found for system: {system_name}")
    return result["script_content"] 