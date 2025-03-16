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
#---------------------------------------------------------------------------------------------------------
# Inheritance System
#--------------------------------------------------------------------------------------------------------

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

        # direct_heirs = {"father", "mother", "husband", "wife", "paternal_grandfather",
        #             "paternal_grandmother", "maternal_grandfather", "maternal_grandmother"}



        # ✅ Step 1: Process Heirs
        for heir, amount in self.results.items():
            if heir == "will":
                continue  # Skip will from direct heir listing

            base_heir = heir.replace("each_", "")  # Ensure correct heir label
            # base_heir = heir.replace("each_", "") if base_heir in direct_heirs else heir


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

    # def get_results_for_db(self):
    #     """Return inheritance distribution in a format suitable for database storage."""
        
    #     results_for_db = {
    #         "original_net_worth": float(self.original_net_worth),  # Convert Decimal to float
    #         "net_worth": float(self.net_worth),
    #         "will": float(self.results.get("will", 0)),  # Ensure will is included
    #         "total_distributed": sum(value for key, value in self.results.items() if key != "will"),
    #         "remaining_residue": float(self.residue),
    #         "heirs": [],
    #         "blocked_heirs": {}
    #     }

    #     # ✅ List of heirs who should **not** have "each_" prefix
    #     direct_heirs = {"father", "mother", "husband", "wife", "paternal_grandfather",
    #                     "paternal_grandmother", "maternal_grandfather", "maternal_grandmother"}

    #     for heir, amount in self.results.items():
    #         if heir == "will":
    #             continue  # Skip will from direct heir listing

    #         # ✅ First, assign base_heir properly
    #         base_heir = heir.replace("each_", "")  # Strip "each_" prefix for all heirs

    #         # ✅ Then, check if it should retain "each_"
    #         if base_heir not in direct_heirs:
    #             base_heir = heir  # Restore "each_" for non-direct heirs

    #         # ✅ Fetch correct count for heirs (Handles singular/plural)
    #         count_attr = f"{base_heir}s" if f"{base_heir}s" in vars(self) else base_heir
    #         count = getattr(self, count_attr, 1)  # Default to 1 if not found

    #         # ✅ Calculate percentage
    #         percentage = (float(amount) / float(self.original_net_worth)) * 100 if self.original_net_worth > 0 else 0

    #         # ✅ Structure each heir's data
    #         heir_data = {
    #             "heir": base_heir,  # Properly formatted heir name
    #             "count": count,
    #             "amount": float(amount),  # Convert to float
    #             "percentage": float(percentage),  # Convert to float
    #             "explanation": self.explanations.get(heir, "No specific rule applied.")
    #         }
    #         results_for_db["heirs"].append(heir_data)

    #     # ✅ Step 2: Process Blocked Heirs
    #     for blocked_heir, reason in self.blocked_heirs.items():
    #         results_for_db["blocked_heirs"][blocked_heir] = reason

    #     return results_for_db

#====================================== RULES ============================================

    def _apply_blocking_rules(self):
        """Apply blocking rules to remove heirs who should not inherit."""
        if (self.sons > 0 or self.daughters > 0 or
             self.husband > 0 or self.wife > 0 or self.father > 0 or self.mother > 0 ):

            if self.paternal_grandfather > 0:
                self.blocked_heirs["paternal_grandfather"] = "Paternal Grandfather is blocked due to presence of direct descendants."
                self.paternal_grandfather = 0

            if self.paternal_grandmother > 0:
                self.blocked_heirs["paternal_grandmother"] = "Paternal Grandmother is blocked due to presence of direct descendants."
                self.paternal_grandmother = 0

            if self.maternal_grandfather > 0:
                self.blocked_heirs["maternal_grandfather"] = "Maternal Grandfather is blocked due to presence of direct descendants."
                self.maternal_grandfather = 0

            if self.maternal_grandmother > 0:
                self.blocked_heirs["maternal_grandmother"] = "Maternal Grandmother is blocked due to presence of direct descendants."
                self.maternal_grandmother = 0
            
            if self.brothers > 0:
                self.blocked_heirs["brothers"] = "Brothers are blocked due to presence of direct descendants."
                self.brothers = 0
            
            if self.sisters > 0:
                self.blocked_heirs["sisters"] = "Sisters are blocked due to presence of direct descendants."
                self.sisters = 0

        
            if self.sons or self.daughters:
                self.grandsons = 0
                self.granddaughters = 0


        #   
        # blocked = [
        #     "father", "brothers", "sisters", "paternal_grandfather",
        #     "paternal_grandmother", "maternal_grandfather", "maternal_grandmother"
        # ]

        # if self.sons > 0 or self.daughters > 0 or self.husband > 0 or self.wife > 0 or self.mother > 0 or self.grandsons > 0 or self.granddaughters > 0:
        #     for heir in blocked:
        #         if getattr(self, heir) > 0:
        #             self.blocked_heirs[heir] = f"{heir.replace('_', ' ').capitalize()} is blocked due to presence of direct descendants."
        #             setattr(self, heir, 0)


    def _calculate_shares(self):
        """Distribute remaining inheritance equally among all eligible heirs."""
        
        eligible_heirs = {
            "sons": self.sons,
            "daughters": self.daughters,
            "grandsons": self.grandsons,
            "granddaughters": self.granddaughters,
            "father": self.father,
            "mother": self.mother,
            "paternal_grandfather": self.paternal_grandfather,
            "paternal_grandmother": self.paternal_grandmother,
            "maternal_grandfather": self.maternal_grandfather,
            "maternal_grandmother": self.maternal_grandmother,
            "brothers": self.brothers,
            "sisters": self.sisters,
            "husband": self.husband,
            "wife": self.wife
        }
        # total_heirs = 0  # Count of all eligible heirs

        


        # ✅ Exclude non-heir attributes
        exclude_keys = {
            "original_net_worth", "net_worth", "will", "fixed_shares", "residue",
            "results", "blocked_heirs", "explanations"
        }
        
        # if self.husband > 0 and (self.sons > 0 or self.daughters > 0):
        #     self.fixed_shares["husband"] = self.net_worth * 1/3
        #     self.explanations["husband"] = "Husband inherits 1/3 of the estate, as there are direct descendants."
        #     # self.net_worth -= self.net_worth * 1/4
        
        # if self.wife > 0 and (self.sons > 0 or self.daughters > 0):
        #     self.fixed_shares["wife"] = self.net_worth * 1/3
        #     self.explanations["wife"] = "Wife inherits 1/3 of the estate, as there are direct descendants."
        #     # self.net_worth -= self.net_worth * 1/4

        # if self.husband > 0 and (self.father > 0 or self.mother > 0 or 
        #                          self.paternal_grandfather or self.paternal_grandmother or self.maternal_grandfather 
        #                          or self.maternal_grandmother):
        #     self.fixed_shares["husband"] = self.net_worth * 1/2
        #     self.explanations["husband"] = "Husband inherits 1/2 of the estate, as there are no direct descendants."

        # if self.wife > 0 and (self.father > 0 or self.mother > 0 or 
        #                          self.paternal_grandfather or self.paternal_grandmother or self.maternal_grandfather 
        #                          or self.maternal_grandmother or self.brothers > 0 or self.sisters > 0):
        #     self.fixed_shares["wife"] = self.net_worth * 1/2
        #     self.explanations["wife"] = "Wife inherits 1/2 of the estate, as there are no direct descendants."
        
        # self.residue = self.net_worth - sum(self.fixed_shares.values())
        # total_heirs = (self.sons + self.daughters + self.grandsons + self.granddaughters 
        #                + self.father + self.mother + self.paternal_grandfather + self.paternal_grandmother + self.maternal_grandfather + self.maternal_grandmother + 
        #                self.brothers + self.sisters+ self.husband + self.wife)
        
        # share_per_heir = self.net_worth / total_heirs

        # if self.sons > 0:
        #     self.fixed_shares["each_son"] = share_per_heir
            
        # if self.daughters > 0:
        #     self.fixed_shares["each_daughter"] = share_per_heir
        
        # if self.grandsons > 0:
        #     self.fixed_shares["each_grandson"] = share_per_heir

        # if self.granddaughters > 0:
        #     self.fixed_shares["each_granddaughter"] = share_per_heir
        
        # if self.husband > 0:
        #     self.fixed_shares["husband"] = share_per_heir
        
        # if self.wife > 0:
        #     self.fixed_shares["wife"] = share_per_heir
        
        # if self.brothers > 0:
        #     self.fixed_shares["each_brother"] = share_per_heir
        
        # if self.sisters > 0:
        #     self.fixed_shares["each_sister"] = share_per_heir

        # Filter out heirs with zero count
        eligible_heirs = {heir: count for heir, count in eligible_heirs.items() if count > 0}

        # Total number of heirs
        total_heirs = sum(eligible_heirs.values())

        # Calculate each heir's share
        share_per_heir = self.net_worth / total_heirs

        # Distribute shares dynamically
        for heir, count in eligible_heirs.items():
            self.fixed_shares[f"each_{heir}"] = share_per_heir


            

        
        # if (self.father > 0 or self.mother > 0 or self.paternal_grandfather > 0 or
        #      self.paternal_grandmother > 0 or self.maternal_grandfather > 0 
        #      or self.maternal_grandmother > 0 or self.brothers > 0 or self.sisters > 0):
        #     total_ascendants = self.father + self.mother + self.paternal_grandfather + self.paternal_grandmother + self.maternal_grandfather + self.maternal_grandmother
        #     if total_ascendants > 0:
        #         share_per_ascendant = self.residue / total_ascendants
        #         if self.father > 0:
        #             self.fixed_shares["father"] = share_per_ascendant
        #         if self.mother > 0:
        #             self.fixed_shares["mother"] = share_per_ascendant
        #         if self.paternal_grandfather > 0:
        #             self.fixed_shares["paternal_grandfather"] = share_per_ascendant
        #         if self.paternal_grandmother > 0:
        #             self.fixed_shares["paternal_grandmother"] = share_per_ascendant
        #         if self.maternal_grandfather > 0:
        #             self.fixed_shares["maternal_grandfather"] = share_per_ascendant
        #         if self.maternal_grandmother > 0:
        #             self.fixed_shares["maternal_grandmother"] = share_per_ascendant
        #         if self.brothers > 0:
        #             self.fixed_shares["each_brother"] = share_per_ascendant
        #         if self.sisters > 0:
        #             self.fixed_shares["each_sister"] = share_per_ascendant

        


        
            # self.net_worth -= self.net_worth * 1/4

        # for heir in vars(self):
        #     value = getattr(self, heir)

            # ✅ Ensure value is an integer, is not an excluded key, and is a valid heir
        #     if (
        #         isinstance(value, int) 
        #         and value > 0 
        #         and heir not in exclude_keys 
        #         and heir not in self.blocked_heirs
        #     ):
        #         eligible_heirs[heir] = value
        #         total_heirs += value  # Sum up the count of all heirs

        # if total_heirs == 0:
        #     print("⚠️ No eligible heirs available to inherit.")
        #     return

        # # ✅ Step 2: Calculate equal share for each heir
        # equal_share = self.net_worth / total_heirs

        # # ✅ Step 3: Assign inheritance to each heir
        # for heir, count in eligible_heirs.items():
        #     self.results[heir] = equal_share * count  # Each heir gets an equal share
        #     # print(f"✅ {heir.capitalize()} inherits: ${self.results[heir]:,.2f} ({count} heir(s))")

        # # ✅ Step 4: Update total distributed amount and residue
        # total_distributed = sum(self.results.values())
        # self.residue = self.net_worth - total_distributed  # Residue should be minimal

        # print(f"\nTotal Distributed: ${total_distributed:,.2f}")
        # print(f"Remaining Residue: ${self.residue:,.2f}")
        # print("===============================\n")

# ---------------- TEST CASE ----------------

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 China_RBS.py <user_id>")
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
    # connection = connect_db()
    # cursor = connection.cursor()
    # cursor.execute("SELECT idInheritanceSystem FROM InheritanceSystem WHERE system_name = %s", ("Hindu Inheritance",))
    # inheritance_system_data = cursor.fetchone()
    # cursor.close()
    # connection.close()

    # if not inheritance_system_data:
    #     print(f"❌ No matching inheritance system found.")
    #     sys.exit(1)

    # inheritance_system_id = inheritance_system_data[0]

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
The China inheritance system is a system that involves the distribution of property among family members. Following a set of class of heirs which determines the distribution of property. The class of heirs are divided into two groups, the primary heirs and the secondary heirs. The primary heirs are the spouse and children of the deceased, while the secondary heirs are the parents and siblings of the deceased. The spouse and children of the deceased are entitled to a share of the property, while the parents and siblings of the deceased are entitled to a share of the property. The spouse and children of the deceased are entitled to a share of the property, while the parents and siblings of the deceased are entitled to a share of the property. The spouse and children of the deceased are entitled to a share of the property, while the parents and siblings of the deceased are entitled to a share of the property."""
    
    output = {
        "json_result": json_result,
        "results_for_db": results_for_db,
        "context_info": context_info
    }
    print(json.dumps(output))