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

    # def get_results_for_db(self):
    #     """Return inheritance distribution in a format suitable for database storage."""
    #     results_for_db = {
    #         "original_net_worth": float(self.original_net_worth),  # Convert Decimal to float
    #         "net_worth": float(self.net_worth),
    #         "will": float(self.results.get("will", 0)),
    #         "total_distributed": float(sum(value for key, value in self.results.items() if key != "will")),
    #         "remaining_residue": float(self.residue),
    #         "heirs": [],
    #         "blocked_heirs": self.blocked_heirs
    #     }

    #     for heir, amount in self.results.items():
    #         if heir == "will":
    #             continue

    #         base_heir = heir.replace("each_", "")
    #         count_attr = base_heir + "s"
    #         count = getattr(self, count_attr, 1)
    #         percentage = (float(amount) / float(self.original_net_worth)) * 100 if self.original_net_worth > 0 else 0

    #         heir_data = {
    #             "heir": base_heir,
    #             "count": count,
    #             "amount": float(amount),  # Convert to float
    #             "percentage": float(percentage),  # Convert to float
    #             "explanation": self.explanations.get(heir, "No specific rule applied.")
    #         }
    #         results_for_db["heirs"].append(heir_data)

    #     return results_for_db

    # def get_results_for_db(self):
    #     """Return inheritance distribution in a format suitable for database storage."""
    #     results_for_db = {
    #         "original_net_worth": float(self.original_net_worth),  # Convert Decimal to float
    #         "net_worth": float(self.net_worth),
    #         "will": float(self.results.get("will", 0)),
    #         "total_distributed": float(sum(value for key, value in self.results.items() if key != "will")),
    #         "remaining_residue": float(self.residue),
    #         "heirs": [],
    #         "blocked_heirs": self.blocked_heirs
    #     }

    #     for heir, amount in self.results.items():
    #         if heir == "will":
    #             continue

    #         base_heir = heir.replace("each_", "")

    #         # ✅ Fix: Ensure count retrieval accounts for non-pluralized names
    #         count_attr = f"{base_heir}s" if f"{base_heir}s" in vars(self) else base_heir
    #         count = getattr(self, count_attr, 1)  # Ensure count is retrieved correctly

    #         percentage = (float(amount) / float(self.original_net_worth)) * 100 if self.original_net_worth > 0 else 0

    #         heir_data = {
    #             "heir": base_heir,
    #             "count": count,
    #             "amount": float(amount),  # Convert to float
    #             "percentage": float(percentage),  # Convert to float
    #             "explanation": self.explanations.get(heir, "No specific rule applied.")
    #         }
    #         results_for_db["heirs"].append(heir_data)

    #     return results_for_db

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

        # return {
        #     "success": True,
        #     "json_result": self.results,  # ✅ Raw JSON inheritance results
        #     "results_for_db": results_for_db  # ✅ Formatted results for database & display
        # }
        return results_for_db

    # ---------------- HELPER METHODS ----------------

    def _apply_blocking_rules(self):
        """Apply blocking rules to remove heirs who should not inherit."""
        blocked = [
            "father", "brothers", "sisters", "paternal_grandfather",
            "paternal_grandmother", "maternal_grandfather", "maternal_grandmother"
        ]

        if self.sons > 0 or self.daughters > 0 or self.husband > 0 or self.wife > 0 or self.mother > 0 or self.grandsons > 0 or self.granddaughters > 0:
            for heir in blocked:
                if getattr(self, heir) > 0:
                    self.blocked_heirs[heir] = f"{heir.replace('_', ' ').capitalize()} is blocked due to presence of direct descendants."
                    setattr(self, heir, 0)

    def _calculate_shares(self):
        """Distribute remaining inheritance equally among all eligible heirs."""
        
        eligible_heirs = {}
        total_heirs = 0  # Count of all eligible heirs

        # ✅ Exclude non-heir attributes
        exclude_keys = {
            "original_net_worth", "net_worth", "will", "fixed_shares", "residue",
            "results", "blocked_heirs", "explanations"
        }

        for heir in vars(self):
            value = getattr(self, heir)

            # ✅ Ensure value is an integer, is not an excluded key, and is a valid heir
            if (
                isinstance(value, int) 
                and value > 0 
                and heir not in exclude_keys 
                and heir not in self.blocked_heirs
            ):
                eligible_heirs[heir] = value
                total_heirs += value  # Sum up the count of all heirs

        if total_heirs == 0:
            print("⚠️ No eligible heirs available to inherit.")
            return

        # ✅ Step 2: Calculate equal share for each heir
        equal_share = self.net_worth / total_heirs

        # ✅ Step 3: Assign inheritance to each heir
        for heir, count in eligible_heirs.items():
            self.results[heir] = equal_share * count  # Each heir gets an equal share
            print(f"✅ {heir.capitalize()} inherits: ${self.results[heir]:,.2f} ({count} heir(s))")

        # ✅ Step 4: Update total distributed amount and residue
        total_distributed = sum(self.results.values())
        self.residue = self.net_worth - total_distributed  # Residue should be minimal

        print(f"\nTotal Distributed: ${total_distributed:,.2f}")
        print(f"Remaining Residue: ${self.residue:,.2f}")
        print("===============================\n")

    # def _calculate_shares(self):
    #     """Distribute remaining inheritance equally among all eligible heirs."""
    #     eligible_heirs = {heir: getattr(self, heir) for heir in vars(self) if getattr(self, heir) > 0 and heir not in self.blocked_heirs}
    #     total_heirs = sum(eligible_heirs.values())

    #     if total_heirs == 0:
    #         print("⚠️ No eligible heirs available to inherit.")
    #         return

    #     equal_share = self.net_worth / total_heirs

    #     for heir, count in eligible_heirs.items():
    #         self.results[heir] = equal_share * count
    #         print(f"✅ {heir.capitalize()} inherits: ${self.results[heir]:,.2f} ({count} heir(s))")

    #     self.residue = self.net_worth - sum(self.results.values())

# ---------------- TEST CASE ----------------

if __name__ == "__main__":
    # Test 1: Basic case with father, mother, and 2 sons
    # print("\n🔹 Test Case 1: Father, Mother, and 2 Sons")
    # inheritance_test_1 = InheritanceSystem(
    #     net_worth=1000,
    #     father=1,
    #     mother=1,
    #     sons=2
    # )
    # inheritance_test_1.compute_inheritance()
    # inheritance_test_1.display_results()
    # inheritance_test_1_results = inheritance_test_1.get_results_for_db()
    # print(inheritance_test_1_results)

    # # Test 2: Case with a will and multiple heirs
    # print("\n🔹 Test Case 2: Will with Sons, Daughters, and a Mother")
    # inheritance_test_2 = InheritanceSystem(
    #     net_worth=1500,
    #     will=500,  # Will amount
    #     sons=2,
    #     daughters=1,
    #     mother=1
    # )
    # inheritance_test_2.compute_inheritance()
    # inheritance_test_2.display_results()
    # inheritance_test_2_results = inheritance_test_2.get_results_for_db()
    # print(inheritance_test_2_results)

    # # Test 3: No direct descendants, only grandparents and siblings
    # print("\n🔹 Test Case 3: Only Grandparents and Siblings")
    # inheritance_test_3 = InheritanceSystem(
    #     net_worth=800,
    #     brothers=2,
    #     sisters=1,
    #     paternal_grandfather=1,
    #     maternal_grandmother=1
    # )
    # inheritance_test_3.compute_inheritance()
    # inheritance_test_3.display_results()
    # inheritance_test_3_results = inheritance_test_3.get_results_for_db()
    # print(inheritance_test_3_results)

    if len(sys.argv) != 2:
        print("Usage: python Hindu_RBS.py <user_id>")
        sys.exit(1)

    user_id = sys.argv[1]
    # user_id = 2

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
    # inheritance_results = inheritance_system.compute_inheritance()
    json_result = json.dumps(inheritance_results)
    results_for_db = inheritance_system.get_results_for_db()
    
    output = {
        "json_result": json_result,
        "results_for_db": results_for_db
    }
    print(json.dumps(output))

# class InheritanceSystem:
#     def __init__(self, net_worth, father=0, mother=0, husband=0, wife=0,
#                  sons=0, daughters=0, brothers=0, sisters=0, grandsons=0, granddaughters=0, 
#                  paternal_grandfather=0, paternal_grandmother=0,maternal_grandfather=0, maternal_grandmother=0, will = 0):
#         self.original_net_worth = net_worth
#         self.net_worth = net_worth
#         self.father = father
#         self.mother = mother
#         self.husband = husband
#         self.wife = wife
#         self.sons = sons
#         self.daughters = daughters or 0 # Default to 0 if None
#         self.brothers = brothers
#         self.sisters = sisters
#         self.grandsons = grandsons
#         self.granddaughters = granddaughters
#         self.paternal_grandfather = paternal_grandfather
#         self.paternal_grandmother = paternal_grandmother
#         self.maternal_grandfather = maternal_grandfather
#         self.maternal_grandmother = maternal_grandmother
#         self.will = will
#         self.fixed_shares = {}
#         self.residue = 0
#         self.results = {}
#         self.blocked_heirs = {}
#         self.explanations = {}
#         self.children = {
#         "sons": self.sons,
#         "daughters": self.daughters
#         }
#         self.grandchildren = {
#         "grandsons": self.grandsons,
#         "granddaughters": self.granddaughters
#         }   


#     def compute_inheritance(self):

#         self._apply_blocking_rules()
#         self._calculate_shares()
#         self.results.update(self.fixed_shares)
#         return self.results

   
#     def display_results(self):
#         """Display inheritance distribution in a readable format with accurate heir count."""
#         print("\n=== Inheritance Distribution ===")
        
#         max_will_allocation = self.original_net_worth / 3  # Maximum allowed is 1/3 of estate
        
#         if "will" in self.results:
#             print(f"Wasiya (Will): ${self.results['will']:,.2f} (Max 1/3 Allowed: ${max_will_allocation:,.2f})")
#             print("_______________________________\n")
        
#         # Remove Wasiya from total distributed calculation
#         total_distributed = sum(value for key, value in self.results.items() if key != "will")

#         for heir, amount in self.results.items():
#             if heir == "will":  # Skip Wasiya since it's already printed
#                 continue
            
#             percentage = (amount / self.net_worth) * 100  # Use reduced net worth for correct % calculation
#             count = getattr(self, heir.replace("each_", "") + "s", 1)  # Get heir count dynamically
            
#             print(f"{heir.replace('_', ' ').capitalize()} (Count: {count:,}) inherits: ${amount:,.2f} ({percentage:,.2f}%)")

#         print(f"\nTotal Distributed: ${total_distributed:,.2f}")
#         print(f"Remaining Residue: ${self.residue:,.2f}")
#         print("===============================\n")

   
#     # -------------- HELPER METHODS --------------

#     def _apply_blocking_rules(self):
#         """Apply blocking rules to remove heirs who should not inherit."""
        
#         if self.sons > 0 or self.daughters > 0 or self.husband > 0 or self.wife > 0 or self.mother > 0 or self.grandsons > 0 or self.granddaughters > 0:
#             if self.father > 0:
#                 self.blocked_heirs['father'] = "Father is blocked because the deceased has direct descendants, mother, spouse, or grandchild."
#                 self.father = 0  # Block father
#             if self.brothers > 0:
#                 self.blocked_heirs['brothers'] = "Brothers are blocked because the deceased has direct descendants, mother, spouse, or grandchild."
#                 self.brothers = 0  # Block brothers
#             if self.sisters > 0:
#                 self.blocked_heirs['sisters'] = "Sisters are blocked because the deceased has direct descendants, mother, spouse, or grandchild."
#                 self.sisters = 0  # Block sisters
#             if self.paternal_grandfather > 0:
#                 self.blocked_heirs['paternal_grandfather'] = "Paternal grandfather is blocked because the deceased has direct descendants, mother, spouse, or grandchild."
#                 self.paternal_grandfather = 0  # Block paternal grandfather
#             if self.paternal_grandmother > 0:
#                 self.blocked_heirs['paternal_grandmother'] = "Paternal grandmother is blocked because the deceased has direct descendants, mother, spouse, or grandchild."
#                 self.paternal_grandmother = 0  # Block paternal grandmother
#             if self.maternal_grandfather > 0:
#                 self.blocked_heirs['maternal_grandfather'] = "Maternal grandfather is blocked because the deceased has direct descendants, mother, spouse, or grandchild."
#                 self.maternal_grandfather = 0  # Block maternal grandfather
#             if self.maternal_grandmother > 0:
#                 self.blocked_heirs['maternal_grandmother'] = "Maternal grandmother is blocked because the deceased has direct descendants, mother, spouse, or grandchild."
#                 self.maternal_grandmother = 0  # Block maternal grandmother
        
#     def _calculate_shares(self):
#         """Calculate shares for each heir based on their respective rules."""
#         # ✅ Step 1: Identify eligible heirs (excluding blocked ones)
#         eligible_heirs = {}
#         total_heirs = 0  # Count of all eligible heirs

#         for heir, count in self.__dict__.items():
#             if heir in self.blocked_heirs or count == 0:
#                 continue  # Skip blocked heirs or those with count 0
            
#             if heir in ["father", "mother", "husband", "wife", "sons", "daughters",
#                         "grandsons", "granddaughters", "brothers", "sisters", 
#                         "paternal_grandfather", "paternal_grandmother", 
#                         "maternal_grandfather", "maternal_grandmother"]:
#                 eligible_heirs[heir] = count
#                 total_heirs += count  # Sum up the count of all heirs

#         if total_heirs == 0:
#             print("⚠️ No eligible heirs available to inherit.")
#             return

#         # ✅ Step 2: Calculate equal share for each heir
#         equal_share = self.net_worth / total_heirs

#         # ✅ Step 3: Assign inheritance to each heir
#         for heir, count in eligible_heirs.items():
#             self.results[heir] = equal_share * count  # Each heir gets an equal share
#             print(f"✅ {heir.capitalize()} inherits: ${self.results[heir]:,.2f} ({count} heir(s))")

#         # ✅ Step 4: Update total distributed amount and residue
#         total_distributed = sum(self.results.values())
#         self.residue = self.net_worth - total_distributed  # Residue should be minimal

#         print(f"\nTotal Distributed: ${total_distributed:,.2f}")
#         print(f"Remaining Residue: ${self.residue:,.2f}")
#         print("===============================\n")

