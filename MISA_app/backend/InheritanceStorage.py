import mysql.connector
import os
import sys

def connect_db():
    """Establish connection to MySQL database."""
    try:
        connection = mysql.connector.connect(
            # host="127.0.0.1",
            # user="root",
            # password="!fg121u03",  
            # database="misa_db"
            host = "132.145.18.222",
            user = "um2005",
            password = "wnd4VKSANY3",
            database = "um2005"
        )
        return connection
    except mysql.connector.Error as err:
        print(f"❌ Database connection error: {err}")
        return None

def store_script(file_path, system_name):
    """Reads a Python script from the backend directory and stores it in the database."""
    connection = connect_db()
    if not connection:
        print("❌ Unable to connect to the database.")
        return
    
    try:
        # Read the script file
        with open(file_path, "r", encoding="utf-8") as file:
            script_content = file.read()

        cursor = connection.cursor()

        # Insert or update the script in the database
        query = """
        INSERT INTO InheritanceSystem (system_name, system_script)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE
        system_script = VALUES(system_script);
        """
        
        cursor.execute(query, (system_name, script_content))
        connection.commit()
        print(f"✅ '{file_path}' stored in the database as '{system_name}'!")

        # Close connection
        cursor.close()
        connection.close()

    except Exception as e:
        print(f"❌ Error storing script: {str(e)}")

def delete_script_file(file_name):
    """Deletes a script file from the file system."""
    current_directory = os.getcwd()
    file_path = os.path.join(current_directory, file_name)

    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            print(f"✅ File '{file_name}' deleted successfully!")
        except Exception as e:
            print(f"❌ Error deleting file '{file_name}': {str(e)}")
    else:
        print(f"❌ Error: File '{file_name}' does not exist!")



if __name__ == "__main__":

    if len(sys.argv) < 3:
        print("Usage: python3 InheritanceStorage.py <script_filename> <system_name>")
        sys.exit(1)

    file_name = sys.argv[1]
    system_name = " ".join(sys.argv[2:]).title()

   
    current_directory = os.getcwd()
    script_directory = os.path.join(current_directory, "DBLogicScripts")
    print(f"\n📂 Current Directory: {current_directory}")
    print(f"📂 Script Directory: {script_directory}")


    # Ask the user for input
    # file_name = input("Enter the script filename (e.g., Islamic_RBS.py): ").strip()
    # system_name = input("Enter the system name (e.g., Islamic Rule-Based System): ").strip()

    # Construct the file path
    file_path = os.path.join(script_directory, file_name)

    # Check if file exists before proceeding
    if os.path.exists(file_path):
        store_script(file_path, system_name)
    else:
        print(f"❌ Error: File '{file_path}' does not exist! Please check the filename and try again.")
    
    # Delete script 
    # delete_choice = input(f"Do you want to delete '{file_name}' from the system? (yes/no): ").strip().lower()
    # if delete_choice == "yes":
    #     delete_script_file(file_name)
