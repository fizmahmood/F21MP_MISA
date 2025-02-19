from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import json

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

# Run the FastAPI app with Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)



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