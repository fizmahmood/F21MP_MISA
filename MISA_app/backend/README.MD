# MISA Backend =======================================================================================================================

The MISA (Multicultural Inheritance Sharing Application) backend serves as the core processing engine for inheritance calculations across multiple cultural and religious systems. It provides a robust API for the frontend to interact with, handles database operations, and executes inheritance calculation scripts securely. 

This folder contains the code for the backend of the MISA (Multicultural Inheritance Sharing Application) application. The backend has been refactored into a modular structure for better maintainability and scalability.

## Directory Structure ==============================================================================================================

# Backend Files
- InheritanceStorage.py: This file contains the script that handles the storage of inheritance sharing logic scripts into the database.
by running: *python3 InheritanceStorage.py <script_filename> <system_name>*

- Server.py: This file contains the script that handles the server side of the application, the database and API instance and routes. This is the legacy server file which the application was built on and refactored to a more modular version which is the backend/app .

# Backend Subdirectories
- App: This directory contains the Flask application instance. It includes the following files:
    - app/execute.py: This handles the execution of inheritance scripts from the database.
    - app/main.py: This file contains  the FastAPI application instance, CORS configuration, and includes all API routes.
    - app/api/routes.py: contains all the api endpoints.
    - app/database/db.py: provides database connectivity and query execution functions.

- DbLogicScripts: This directory contains all the executable inheritance sharing logic scrips. These scripts are stored in the     database and executed by the backend. 
    - dbLogicScripts/scriptChina.py: This is an executable script for China's inheritance sharing logic.
    - dbLogicScripts/scriptHindu.py: This is an executable script for Hinduism's inheritance sharing logic.
    - dbLogicScripts/scriptIndia.py: This is an executable script for India's inheritance sharing logic.
    - dbLogicScripts/scriptIslam.py: This is an executable script for Islam's inheritance sharing logic.
    - dbLogicScripts/scriptRussia.py: This is an executable script for Russia's inheritance sharing logic.
    - # Script for Yoruba inheritance sharing will be added 

- InheritanceLogic: This directory contains all the executable inheritance sharing logic scrips. These are the scripts these are standalone python scripts that which ran on localhost or standalone.
    - inheritanceLogic/scriptChina.py: This is an executable script for China's inheritance sharing logic.
    - inheritanceLogic/scriptHindu.py: This is an executable script for Hinduism's inheritance sharing logic
    - inheritanceLogic/scriptIndia.py: This is an executable script for India's inheritance sharing logic
    - inheritanceLogic/scriptIslam.py: This is an executable script for Islam's inheritance sharing logic
    - inheritanceLogic/scriptRussia.py: This is an executable script for Russia's inheritance sharing logic
    - # Script for Yoruba inheritance sharing will be added