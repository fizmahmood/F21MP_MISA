#Yoruba Inheritance System
import networkx as nx
import matplotlib.pyplot as plt
import sys
import json
import mysql.connector
from decimal import Decimal

#---------------------------------------------------------------------------------------------------------
# DATABASE INTERACTION
#--------------------------------------------------------------------------------------------------------

def connect_db():
    """Establish connection to MySQL database."""
    try:
        connection = mysql.connector.connect(
            host="127.0.0.1",
            user="root",
            password="!fg121u03",  # Update with your actual password
            database="misa_db"
        )
        return connection
    except mysql.connector.Error as err:
        print(f"❌ Database connection error: {err}")
        sys.exit(1)

def get_user_inheritance_data(user_id):
    """Retrieve inheritance data from the database based on user_id."""
    connection = connect_db()
    cursor = connection.cursor(dictionary=True)

    try:
        query = """SELECT * FROM Facts WHERE Users_user_id = %s"""
        cursor.execute(query, (user_id,))
        data = cursor.fetchone()
        cursor.close()
        connection.close()

        if data:
            return data
        else:
            print(f"❌ No inheritance data found for User ID: {user_id}")
            sys.exit(1)

    except mysql.connector.Error as err:
        print(f"❌ Error fetching user data: {err}")
        sys.exit(1)

def store_results_in_db(user_id, facts_id, inheritance_system_id, results_for_db, detailed_results):
    """Stores inheritance results in the database."""
    connection = connect_db()
    cursor = connection.cursor()

    try:
        json_result = json.dumps(results_for_db)  # Convert results to JSON
        detailed_result = json.dumps(detailed_results)  # Convert detailed breakdown to JSON

        query = """
        INSERT INTO InheritanceResults (name, json_result, detailed_result, InheritanceSystem_idInheritanceSystem, Facts_id, Users_user_id)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            json_result = VALUES(json_result),
            detailed_result = VALUES(detailed_result),
            InheritanceSystem_idInheritanceSystem = VALUES(InheritanceSystem_idInheritanceSystem),
            Facts_id = VALUES(Facts_id)
        """
        values = ("Hindu Inheritance", json_result, detailed_result, inheritance_system_id, facts_id, user_id)

        cursor.execute(query, values)
        connection.commit()
        print(f"✅ Inheritance results stored for user {user_id}.")

    except mysql.connector.Error as err:
        print(f"❌ Error inserting inheritance results: {err}")

    finally:
        cursor.close()
        connection.close()

class InheritanceSystem:
    def __init__(self, net_worth, father=0, mother=0, husband=0, wife=0,
                 sons=0, daughters=0, brothers=0, sisters=0, grandsons=0, granddaughters=0, 
                 paternal_grandfather=0, paternal_grandmother=0, maternal_grandfather=0, maternal_grandmother=0, will=0):
        """Initialize inheritance details."""
        self.original_net_worth = net_worth
        self.net_worth = net_worth
        self.father = father
        self.mother = mother
        self.husband = husband
        self.wife = wife
        self.sons = sons
        self.daughters = daughters or 0  # Default to 0 if None
        self.brothers = brothers
        self.sisters = sisters
        self.grandsons = grandsons
        self.granddaughters = granddaughters
        self.paternal_grandfather = paternal_grandfather
        self.paternal_grandmother = paternal_grandmother
        self.maternal_grandfather = maternal_grandfather
        self.maternal_grandmother = maternal_grandmother
        self.will = will
        self.fixed_shares = {}
        self.residue = 0
        self.results = {}
        self.blocked_heirs = {}
        self.explanations = {}

    def compute_inheritance(self):
        """Compute inheritance by applying rules and distributing shares."""
        self._apply_blocking_rules()
        self._calculate_shares()
        self.results.update(self.fixed_shares)
        return self.results

    def display_results(self):
        """Display inheritance distribution in a readable format."""
        print("\n=== Inheritance Distribution ===")

        max_will_allocation = self.original_net_worth / 3  # Maximum allowed is 1/3 of estate
        
        if "will" in self.results and self.results["will"] > 0:
            print(f"Wasiya (Will): ${self.results['will']:,.2f} (Max 1/3 Allowed: ${max_will_allocation:,.2f})")
            print("_______________________________\n")
        
        # Calculate total distributed excluding will
        total_distributed = sum(value for key, value in self.results.items() if key != "will")

        for heir, amount in self.results.items():
            if heir == "will":  # Skip Wasiya since it's already printed
                continue
            
            percentage = (amount / self.original_net_worth) * 100  # Use full net worth for correct % calculation
            count = getattr(self, heir.replace("each_", "") + "s", 1)  # Get heir count dynamically
            
            print(f"{heir.replace('_', ' ').capitalize()} (Count: {count}) inherits: ${amount:,.2f} ({percentage:.2f}%)")

        print(f"\nTotal Distributed: ${total_distributed:,.2f}")
        print(f"Remaining Residue: ${self.residue:,.2f}")
        print("===============================\n")

    def get_results_for_db(self):
        """Return inheritance distribution in a format suitable for database storage."""
        
        # Initialize dictionary structure
        results_for_db = {
            "original_net_worth": float(self.original_net_worth),  # Convert Decimal to float
            "net_worth": float(self.net_worth),
            "will": float(self.results.get("will", 0)),  # Ensure will is included
            "total_distributed": sum(value for key, value in self.results.items() if key != "will"),
            "remaining_residue": float(self.residue),
            "heirs": [],
            "blocked_heirs": {}
        }

        # ✅ Step 1: Process Heirs
        for heir, amount in self.results.items():
            if heir == "will":
                continue  # Skip will from direct heir listing

            base_heir = heir.replace("each_", "")  # Ensure correct heir label

            # ✅ Fetch correct count for heirs (Handles singular/plural)
            count_attr = f"{base_heir}s" if f"{base_heir}s" in vars(self) else base_heir
            count = getattr(self, count_attr, 1)  # Default to 1 if not found

            # ✅ Calculate percentage
            percentage = (float(amount) / float(self.original_net_worth)) * 100 if self.original_net_worth > 0 else 0

            # ✅ Structure each heir's data
            heir_data = {
                "heir": base_heir,
                "count": count,
                "amount": float(amount),  # Convert to float
                "percentage": float(percentage),  # Convert to float
                "explanation": self.explanations.get(heir, "No specific rule applied.")
            }
            results_for_db["heirs"].append(heir_data)

        # ✅ Step 2: Process Blocked Heirs
        for blocked_heir, reason in self.blocked_heirs.items():
            results_for_db["blocked_heirs"][blocked_heir] = reason

        return results_for_db

    # ---------------- HELPER METHODS ----------------

    def _apply_blocking_rules(self):
        """Apply blocking rules to remove heirs who should not inherit."""
        if self.sons > 0 or self.daughters > 0:
            if self.father > 0:
                self.blocked_heirs["father"] = "Father is blocked due to the presence of children."
                self.father = 0

            if self.mother > 0:
                self.blocked_heirs["mother"] = "Mother is blocked due to the presence of children."

            if self.brothers > 0:
                self.blocked_heirs["brothers"] = "Brothers are blocked due to the presence of children."
                self.brothers = 0
            
            if self.sisters > 0:
                self.blocked_heirs["sisters"] = "Sisters are blocked due to the presence of children."
                self.sisters = 0
            
            if self.paternal_grandfather > 0:
                self.blocked_heirs["paternal grandfather"] = "Paternal grandfather is blocked due to the presence of children."
                self.paternal_grandfather = 0

            if self.paternal_grandmother > 0:
                self.blocked_heirs["paternal grandmother"] = "Paternal grandmother is blocked due to the presence of children."
                self.paternal_grandmother
            
            if self.maternal_grandfather > 0:
                self.blocked_heirs["maternal grandfather"] = "Maternal grandfather is blocked due to the presence of children."
                self.maternal_grandfatheraternal_grandfather = 0

            if self.maternal_grandmother > 0:
                self.blocked_heirs["maternal grandmother"] = "Maternal grandmother is blocked due to the presence of children."
                self.maternal_grandmother
            
            if self.grandsons > 0:
                self.blocked_heirs["grandsons"] = "Grandsons are blocked due to the presence of children."
                self.grandsons = 0
            
            if self.granddaughters > 0:
                self.blocked_heirs["granddaughters"] = "Granddaughters are blocked due to the presence of children."
                self.granddaughters = 0

            

                

        if self.father > 0 and not(self.sons > 0 or self.daughters > 0):
            if self.brothers > 0:
                self.blocked_heirs["brothers"] = "Brothers are blocked due to the presence of father."
                self.brothers = 0
            
            if self.sisters > 0:
                self.blocked_heirs["sisters"] = "Sisters are blocked due to the presence of father."
                self.sisters = 0
            
            if self.paternal_grandfather > 0:
                self.blocked_heirs["paternal grandfather"] = "Paternal grandfather is blocked due to the presence of father."
                self.paternal_grandfather = 0

            if self.paternal_grandmother > 0:
                self.blocked_heirs["paternal grandmother"] = "Paternal grandmother is blocked due to the presence of father."
                self.paternal_grandmother
            
            if self.maternal_grandfather > 0:
                self.blocked_heirs["maternal grandfather"] = "Maternal grandfather is blocked due to the presence of father."
                self.maternal_grandfatheraternal_grandfather = 0

            if self.maternal_grandmother > 0:
                self.blocked_heirs["maternal grandmother"] = "Maternal grandmother is blocked due to the presence of father."
                self.maternal_grandmother
            
            if self.grandsons > 0:
                self.blocked_heirs["grandsons"] = "Grandsons are blocked due to the presence of father."
                self.grandsons = 0
            
            if self.granddaughters > 0:
                self.blocked_heirs["granddaughters"] = "Granddaughters are blocked due to the presence of father."
                self.granddaughters = 0


        if (self.brothers > 0 or self.sisters > 0) and not(self.father > 0 or self.mother > 0):
            if self.paternal_grandfather > 0:
                self.blocked_heirs["paternal grandfather"] = "Paternal grandfather is blocked due to the presence of siblings."
                self.paternal_grandfather = 0

            if self.paternal_grandmother > 0:
                self.blocked_heirs["paternal grandmother"] = "Paternal grandmother is blocked due to the presence of siblings."
                self.paternal_grandmother
            
            if self.maternal_grandfather > 0:
                self.blocked_heirs["maternal grandfather"] = "Maternal grandfather is blocked due to the presence of siblings."
                self.maternal_grandfatheraternal_grandfather = 0

            if self.maternal_grandmother > 0:
                self.blocked_heirs["maternal grandmother"] = "Maternal grandmother is blocked due to the presence of siblings."
                self.maternal_grandmother
        



        if self.brothers > 0 or self.sisters > 0:
            if self.paternal_grandfather > 0:
                self.blocked_heirs["paternal grandfather"] = "Paternal grandfather is blocked due to the presence of siblings."
                self.paternal_grandfather = 0

            if self.paternal_grandmother > 0:
                self.blocked_heirs["paternal grandmother"] = "Paternal grandmother is blocked due to the presence of siblings."
                self.paternal_grandmother
            
            if self.maternal_grandfather > 0:
                self.blocked_heirs["maternal grandfather"] = "Maternal grandfather is blocked due to the presence of siblings."
                self.maternal_grandfatheraternal_grandfather = 0

            if self.maternal_grandmother > 0:
                self.blocked_heirs["maternal grandmother"] = "Maternal grandmother is blocked due to the presence of siblings."
                self.maternal_grandmother

            
        if self.paternal_grandfather > 0 or self.paternal_grandmother > 0:
            if self.maternal_grandfather > 0:
                self.blocked_heirs["maternal grandfather"] = "Maternal grandfather is blocked due to the presence of paternal grandparent."
                self.maternal_grandfatheraternal_grandfather = 0

            if self.maternal_grandmother > 0:
                self.blocked_heirs["maternal grandmother"] = "Maternal grandmother is blocked due to the presence of paternal grandparent."
                self.maternal_grandmother
        


        if self.husband > 0:
            self.blocked_heirs["husband"] = "Husband is blocked because husband is not considered as bloodline"
            self.husband = 0

        if self.wife > 0:
            self.blocked_heirs["wife"] = "Wife is blocked because wife is not considered as bloodline"
            self.wife = 0

        

    def _calculate_shares(self):
        """Distribute remaining inheritance equally among all eligible heirs."""
        
        eligible_heirs = {}
        total_heirs = 0  # Count of all eligible heirs

        # ✅ Exclude non-heir attributes
        exclude_keys = {
            "original_net_worth", "net_worth", "will", "fixed_shares", "residue",
            "results", "blocked_heirs", "explanations"
        }
        
        if self.father > 0 and self.mother > 0:
            self.fixed_shares["father"] = self.net_worth * 2/3
            self.explanations["father"] = "Father receives a larger portion of the inheritance"
            self.fixed_shares["mother"] = self.net_worth * 1/3
            self.explanations["mother"] = "Mother receives a smaller portion of the inheritance"
        
        
        if (self.mother > 0 and not (self.father > 0)) and (self.brothers > 0 or self.sisters > 0):
            total_siblings = self.brothers + self.sisters
            if total_siblings == 1:
                self.fixed_shares["mother"] = self.net_worth * 2/3
                self.explanations["mother"] = "Mother receives a larger portion of the inheritance"
                if self.sister > 0: 
                    self.fixed_shares["sisters"] = self.net_worth * 1/3
                    self.explanations["sisters"] = "Sister receives a smaller portion of the inheritance."
                if self.brother > 0:
                    self.fixed_shares["brothers"] = self.net_worth * 1/3
                    self.explanations["brothers"] = "Brother receives a smaller portion of the inheritance."
            else:
                self.fixed_shares["mother"] = self.net_worth * 1/2
                self.explanations["mother"] = "Mother receives a portion of the inheritance"
                self.residue = self.net_worth - sum (self.fixed_shares.values())
                share_per_sibling = self.residue / total_siblings
                if self.brothers > 0 :
                    self.fixed_shares["each_brother"] = share_per_sibling
                    self.explanations["brother"] = "Each sibling recieves an equal portion of the remainder of the inheritance after the mother's share"
                if self.sisters > 0:    
                    self.fixed_shares["each_sister"] = share_per_sibling
                    self.explanations["sister"] = "Each sibling recieves an equal portion of the remainder of the inheritance after the mother's share"
        if self.brothers > 0 or self.sisters > 0:
            total_siblings = self.brothers + self.sisters
            share_per_sibling = self.net_worth / total_siblings
            if self.brothers > 0 :
                self.fixed_shares["each_brother"] = share_per_sibling
                self.explanations["each_brother"] = "Each sibling recieves an equal share of the inheritance"
            if self.sisters > 0:    
                self.fixed_shares["each_sister"] = share_per_sibling
                self.explanations["each_sister"] = "Each sibling recieves an equal share of the inheritance"

        if self.sons > 0 or self.daughters > 0:
            total_children = self.sons + self.daughters
            share_per_child = self.net_worth / total_children
            if self.sons > 0 :
                self.fixed_shares["each_son"] = share_per_child
                self.explanations["each_son"] = "Each child receives an equal share of the inheritance"
            if self.daughters > 0:    
                self.fixed_shares["each_daughter"] = share_per_child
                self.explanations["each_daughter"] = "Each child receives an equal share of the inheritance"
        
        if self.father > 0 and not self.mother > 0:
            self.fixed_shares["father"] = self.net_worth
            self.explanations["father"] = "Father receives the entire inheritance"
        



# ---------------- TEST CASE ----------------

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python Hindu_RBS.py <user_id>")
        sys.exit(1)

    user_id = sys.argv[1]

    # Fetch user facts
    connection = connect_db()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Facts WHERE Users_user_id = %s", (user_id,))
    user_data = cursor.fetchone()
    cursor.close()
    connection.close()

    if not user_data:
        print(f"❌ No facts found for user {user_id}")
        sys.exit(1)

    # Extract `facts_id`
    facts_id = user_data["facts_id"]

    # Find InheritanceSystem ID (Hindu System)
    connection = connect_db()
    cursor = connection.cursor()
    cursor.execute("SELECT idInheritanceSystem FROM InheritanceSystem WHERE system_name = %s", ("Hindu Inheritance",))
    inheritance_system_data = cursor.fetchone()
    cursor.close()
    connection.close()

    if not inheritance_system_data:
        print(f"❌ No matching inheritance system found.")
        sys.exit(1)

    inheritance_system_id = inheritance_system_data[0]

    # Run Inheritance Calculation
    inheritance_system = InheritanceSystem(
        net_worth=float(user_data.get("networth", 0)),  # Convert Decimal to float
        will=float(user_data.get("will_amount", 0)),
        father=user_data.get("father", 0),
        mother=user_data.get("mother", 0),
        husband=user_data.get("husband", 0),
        wife=user_data.get("wife", 0),
        sons=user_data.get("sons", 0),
        daughters=user_data.get("daughters", 0),
        brothers=user_data.get("brothers", 0),
        sisters=user_data.get("sisters", 0),
        grandsons=user_data.get("grandsons", 0),
        granddaughters=user_data.get("granddaughters", 0),
        paternal_grandfather=user_data.get("paternal_grandfather", 0),
        paternal_grandmother=user_data.get("paternal_grandmother", 0),
        maternal_grandfather=user_data.get("maternal_grandfather", 0),
        maternal_grandmother=user_data.get("maternal_grandmother", 0)
    )

    inheritance_results = inheritance_system.compute_inheritance()
    json_result = json.dumps(inheritance_results)
    results_for_db = inheritance_system.get_results_for_db()
    context_info = """
The yoruba inheritance ."""
    
    output = {
        "json_result": json_result,
        "results_for_db": results_for_db,
        "context_info": context_info

    }
    print(json.dumps(output))