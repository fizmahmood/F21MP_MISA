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
        """
        values = ("Islamic Inheritance", json_result, detailed_result, inheritance_system_id, facts_id, user_id)

        cursor.execute(query, values)
        connection.commit()
        print(f"✅ Inheritance results stored for user {user_id}.")

    except mysql.connector.Error as err:
        print(f"❌ Error inserting inheritance results: {err}")

    finally:
        cursor.close()
        connection.close()
        
#---------------------------------------------------------------------------------------------------------
# InheritanceSystem
#--------------------------------------------------------------------------------------------------------
    
class InheritanceSystem:
    def __init__(self, net_worth, father=0, mother=0, husband=0, wife=0,
                 sons=0, daughters=0, brothers=0, sisters=0, grandsons=0, granddaughters=0, 
                 grandfather=0, grandmother=0, will = 0):
        self.original_net_worth = net_worth
        self.net_worth = net_worth
        self.father = father
        self.mother = mother
        self.husband = husband
        self.wife = wife
        self.sons = sons
        self.daughters = daughters
        self.brothers = brothers
        self.sisters = sisters
        self.grandsons = grandsons
        self.granddaughters = granddaughters
        self.grandfather = grandfather
        self.grandmother = grandmother
        self.will = will
        self.fixed_shares = {}
        self.residue = 0
        self.results = {}
        self.blocked_heirs = {}
        self.explanations = {}
        self.children = {
        "sons": self.sons,
        "daughters": self.daughters
        }
        self.grandchildren = {
        "grandsons": self.grandsons,
        "granddaughters": self.granddaughters
        }   


    def compute_inheritance(self):
        """Run the entire inheritance calculation, including blocking rules."""

        # Check if there is a Wasiya
        if self.will > 0:
            max_will = self.net_worth / 3  # Maximum allowed is 1/3 of estate
            if self.will > max_will:
                self.will = max_will  # Limit to 1/3 of estate

            # Deduct Wasiya from estate before inheritance
            self.net_worth -= self.will
            self.results["will"] = self.will  # Store Wasiya in results

        self._apply_blocking_rules()
        self._calculate_fixed_shares()
        self._distribute_residue()
        self.results.update(self.fixed_shares)
        return self.results

   
    def display_results(self):
        """Display inheritance distribution in a readable format with accurate heir count."""
        print("\n=== Inheritance Distribution ===")
        
        max_will_allocation = self.original_net_worth / 3  # Maximum allowed is 1/3 of estate
        
        if "will" in self.results:
            print(f"Wasiya (Will): ${self.results['will']:,.2f} (Max 1/3 Allowed: ${max_will_allocation:,.2f})")
            print("_______________________________\n")
        
        # Remove Wasiya from total distributed calculation
        total_distributed = sum(value for key, value in self.results.items() if key != "will")

        for heir, amount in self.results.items():
            if heir == "will":  # Skip Wasiya since it's already printed
                continue
            
            percentage = (amount / self.net_worth) * 100  # Use reduced net worth for correct % calculation
            count = getattr(self, heir.replace("each_", "") + "s", 1)  # Get heir count dynamically
            
            print(f"{heir.replace('_', ' ').capitalize()} (Count: {count:,}) inherits: ${amount:,.2f} ({percentage:,.2f}%)")

        print(f"\nTotal Distributed: ${total_distributed:,.2f}")
        print(f"Remaining Residue: ${self.residue:,.2f}")
        print("===============================\n")

   
    # -------------- HELPER METHODS --------------

    def _apply_blocking_rules(self):
        """Apply blocking rules to remove heirs who should not inherit."""
        # self.blocked_heirs = {}  # Dictionary to store blocked heirs and reasons

        # Brothers and sisters are blocked if father or grandfather exists
        if self.father > 0 or self.grandfather > 0:
            if self.brothers > 0:
                self.blocked_heirs['brothers'] = "Brothers are blocked because the father or grandfather is alive."
                self.brothers = 0  # Block brothers
            if self.sisters > 0:
                self.blocked_heirs['sisters'] = "Sisters are blocked because the father or grandfather is alive."
                self.sisters = 0  # Block sisters

        # Grandsons and granddaughters are blocked if the deceased has sons
        if self.sons > 0:
            if self.grandsons > 0:
                self.blocked_heirs['grandsons'] = "Grandsons are blocked because the deceased has direct sons."
                self.grandsons = 0  # Block grandsons
            if self.granddaughters > 0:
                self.blocked_heirs['granddaughters'] = "Granddaughters are blocked because the deceased has direct sons."
                self.granddaughters = 0  # Block granddaughters

        # Grandfather is blocked if the father is alive
        if self.father > 0 and self.grandfather > 0:
            self.blocked_heirs['grandfather'] = "Grandfather is blocked because the father is alive."
            self.grandfather = 0

        # Grandmother is blocked if mother is alive
        if self.mother > 0 and self.grandmother > 0:
            self.blocked_heirs['grandmother'] = "Grandmother is blocked because the mother is alive."
            self.grandmother = 0

    # ----------------------------------------------------
    # def get_results_for_db(self):
    #     """Return inheritance distribution in a format suitable for database storage."""
    #     results_for_db = {
    #         "original_net_worth": self.original_net_worth,
    #         "net_worth": self.net_worth,
    #         "will": self.results.get("will", 0),
    #         "total_distributed": sum(value for key, value in self.results.items() if key != "will"),
    #         "remaining_residue": self.residue,
    #         "heirs": [],
    #         "blocked_heirs": self.blocked_heirs
    #     }

    #     for heir, amount in self.results.items():
    #         if heir == "will":
    #             continue

    #         base_heir = heir.replace("each_", "")
    #         count_attr = base_heir + "s"
    #         count = getattr(self, count_attr, 1)
    #         # percentage = (amount / self.original_net_worth) * 100 if self.original_net_worth > 0 else 0
    #         percentage = (amount / float(self.original_net_worth)) * 100 if float(self.original_net_worth) > 0 else 0

    #         heir_data = {
    #             "heir": base_heir,
    #             "count": count,
    #             "amount": amount,
    #             "percentage": percentage,
    #             "explanation": self.explanations.get(heir, "No specific rule applied.")
    #         }
    #         results_for_db["heirs"].append(heir_data)

    #     return results_for_db

    def get_results_for_db(self):
        """Return inheritance distribution in a format suitable for database storage."""
        results_for_db = {
            "original_net_worth": float(self.original_net_worth),  # Convert Decimal to float
            "net_worth": float(self.net_worth),
            "will": float(self.results.get("will", 0)),
            "total_distributed": float(sum(value for key, value in self.results.items() if key != "will")),
            "remaining_residue": float(self.residue),
            "heirs": [],
            "blocked_heirs": self.blocked_heirs
        }

        for heir, amount in self.results.items():
            if heir == "will":
                continue

            base_heir = heir.replace("each_", "")
            count_attr = base_heir + "s"
            count = getattr(self, count_attr, 1)
            percentage = (float(amount) / float(self.original_net_worth)) * 100 if self.original_net_worth > 0 else 0

            heir_data = {
                "heir": base_heir,
                "count": count,
                "amount": float(amount),  # Convert to float
                "percentage": float(percentage),  # Convert to float
                "explanation": self.explanations.get(heir, "No specific rule applied.")
            }
            results_for_db["heirs"].append(heir_data)

        return results_for_db

    def display_results(self):
        """Display inheritance distribution in a readable format with explanations."""
        results_for_db = self.get_results_for_db()
        """Display inheritance distribution in a readable format with explanations."""
        print("\n=== Inheritance Distribution ===")

        # **1️⃣ Display Wasiya (Will)**
        max_will_allocation = self.original_net_worth / 3  # Maximum allowed is 1/3 of estate
        if "will" in self.results:
            will_percentage = (self.results["will"] / self.original_net_worth) * 100  # Calculate percentage of Wasiya
            print(f"Wasiya (Will): ${self.results['will']:,.2f} ({will_percentage:.2f}%) (Max 1/3 Allowed: ${max_will_allocation:,.2f})")
            print("_______________________________\n")

        # **2️⃣ Compute total distributed**
        total_distributed = sum(value for key, value in self.results.items() if key != "will")

        # **3️⃣ Display inheritance shares (fixed + residual)**
        for heir, amount in self.results.items():
            if heir == "will":  # Skip Wasiya since it was already printed
                continue

            # **Fix Residual Share Percentages**
            percentage = (amount / self.original_net_worth) * 100 if self.original_net_worth > 0 else 0

            # **Fix heir count retrieval**
            base_heir = heir.replace("each_", "")  # Remove "each_" prefix if present
            count_attr = base_heir + "s"  # Convert singular to plural to match class attributes

            # **Get count dynamically** (handle special case for husband/wife)
            count = getattr(self, count_attr, 1)

            # **Fix singular/plural label formatting**
            if count > 1:
                heir_label = f"{base_heir.capitalize()}s"
            else:
                heir_label = base_heir.capitalize()

            # **Print the share details**
            print(f"{heir_label} (Count: {count:,}) inherits: ${amount:,.2f} ({percentage:,.2f}%)")

            # **Print explanation if available**
            explanation = self.explanations.get(heir, "No specific rule applied.")
            print(f"🔹 Explanation: {explanation}\n")

        # **4️⃣ Display Blocked Heirs**
        if self.blocked_heirs:
            print("\n=== Blocked Heirs ===")
            for heir, reason in self.blocked_heirs.items():
                print(f"❌ {heir.replace('_', ' ').capitalize()} was blocked.")
                print(f"🔹 Reason: {reason}\n")
        else:
            print("\n=== No Blocked Heirs ===")

        # **5️⃣ Print final totals**
        print(f"\nTotal Distributed: ${total_distributed:,.2f}")
        print(f"Remaining Residue: ${self.residue:,.2f}")
        print("===============================\n")
    

    def _calculate_fixed_shares(self):
        """Calculate and allocate fixed shares for parents, spouses, and heirs with proportional scaling if needed."""
        total_fixed = 0
        fixed_shares = {}

        # Parents
        if self.father:
            fixed_shares['father'] = self._allocate_fixed_share('father', 1 / 6)

        if self.mother:
            if self.sons or self.daughters or self.grandsons or self.granddaughters:
                fixed_shares['mother'] = self._allocate_fixed_share('mother', 1 / 6)
            else:
                fixed_shares['mother'] = self._allocate_fixed_share('mother', 1 / 3)

        if self.grandfather:
            fixed_shares['grandfather'] = self._allocate_fixed_share('grandfather', 1 / 6)

        if self.grandmother:
            if self.sons or self.daughters or self.grandsons or self.granddaughters:
                fixed_shares['grandmother'] = self._allocate_fixed_share('grandmother', 1 / 6)
            else:
                fixed_shares['grandmother'] = self._allocate_fixed_share('grandmother', 1 / 3)

        # Spouses
        if self.husband:
            if self.sons or self.daughters:
                fixed_shares['husband'] = self._allocate_fixed_share('husband', 1 / 4)
            else:
                fixed_shares['husband'] = self._allocate_fixed_share('husband', 1 / 2)

        if self.wife:
            if self.sons or self.daughters or self.grandsons or self.granddaughters:
                fixed_shares['wife'] = self._allocate_fixed_share('wife', 1 / 8)
            else:
                fixed_shares['wife'] = self._allocate_fixed_share('wife', 1 / 4)

        # Daughters (Only if no sons)
        if self.daughters and not self.sons:
            if self.daughters == 1:
                fixed_shares['daughters'] = self._allocate_fixed_share('daughters', 1 / 2)
            else:
                fixed_shares['daughters'] = self._allocate_fixed_share('daughters', 2 / 3)
                self.results['each_daughter'] = self.fixed_shares['daughters'] / self.daughters

        # Granddaughters (Only if no grandsons, no sons, and no daughters)
        if self.granddaughters and not self.grandsons and not self.sons and not self.daughters:
            if self.granddaughters == 1:
                fixed_shares['granddaughters'] = self._allocate_fixed_share('granddaughters', 1 / 2)
            else:
                fixed_shares['granddaughters'] = self._allocate_fixed_share('granddaughters', 2 / 3)
                self.results['each_granddaughter'] = self.fixed_shares['granddaughters'] / self.granddaughters

        # Sisters (Only if no brothers)
        if self.sisters and not self.brothers:
            if self.sisters == 1:
                fixed_shares['sisters'] = self._allocate_fixed_share('sisters', 1 / 2)
            else:
                fixed_shares['sisters'] = self._allocate_fixed_share('sisters', 2 / 3)
                self.results['each_sister'] = self.fixed_shares['sisters'] / self.sisters

        # Compute total allocated before scaling
        total_fixed = sum(fixed_shares.values())

        # Apply proportional scaling if total fixed share exceeds available estate
        if total_fixed > self.net_worth:
            scaling_factor = self.net_worth / total_fixed
            for heir in fixed_shares:
                fixed_shares[heir] *= scaling_factor

        # Store adjusted fixed shares
        self.fixed_shares = fixed_shares
        # self.residue = self.net_worth - sum(fixed_shares.values())
        self.residue = float(self.net_worth) - sum(fixed_shares.values())  # ✅ Convert net_worth to float

    def _allocate_fixed_share(self, heir, fraction):
        """Allocate a fixed share to an heir and return the allocated amount."""
        if getattr(self, heir, 0) > 0:
            return float(self.net_worth) * fraction  # ✅ Convert to float
        return 0

    def _distribute_residue(self):
        """Distribute the remaining residue among Asaba heirs as per Islamic inheritance rules."""
        if self.residue <= 0:
             return  # No residue to distribute

        # **Sons and Daughters (Asaba)**
        if self.sons or self.daughters:
            self._distribute_to_children()

        # **Grandsons and Granddaughters (If no direct sons exist)**
        elif self.grandsons or self.granddaughters:
            self._distribute_to_grandchildren()

        # **Father gets residue if no children or grandchildren exist**
        elif self.father:
            self._give_residue_to_father()

        # **Grandfather gets residue if no father, children, or grandchildren exist**
        elif self.grandfather:
            self._give_residue_to_grandfather()

        # **Brothers and Sisters (if no children, father, or grandfather)**
        elif self.brothers or self.sisters:
            self._distribute_to_siblings()

        # **Brothers alone (if no children, father, grandfather, or sisters)**
        elif self.brothers:
            self._distribute_to_brothers()

        # **Daughters get residue if no sons exist and father is alive**
        elif self.residue > 0 and self.father and self.daughters and not self.sons:
            self._give_residue_to_daughters()

        # **Handle any remaining residue that wasn't distributed**
        if self.residue > 0:
            self.results['undistributed_residue'] = self.residue

    def _distribute_to_children(self):
        """Distribute residue among sons and daughters with a 2:1 ratio."""
        total_shares = (2 * self.sons) + (1 * self.daughters)

        if total_shares == 0:  # No children to distribute to
            return

        share_per_unit = self.residue / total_shares

        if self.sons:
            self.results['each_son'] = 2 * share_per_unit
        if self.daughters:
            self.results['each_daughter'] = share_per_unit

        self.residue = 0 

    def _distribute_to_grandchildren(self):
        """Distribute residue among grandsons and granddaughters with a 2:1 ratio."""
        total_shares = (2 * self.grandsons) + (1 * self.granddaughters)
        share_per_unit = self.residue / total_shares
        self.results['each_grandson'] = 2 * share_per_unit if self.grandsons else 0
        self.results['each_granddaughter'] = 1 * share_per_unit if self.granddaughters else 0
        self.residue = 0  # Fully distributed

    def _distribute_to_sons(self):
        """Distribute residue to sons only"""
        self.results['each_son'] = self.residue / self.sons
        self.residue = 0

    def _give_residue_to_father(self):
        """If no children or grandchildren exist, the father inherits all residue."""
        self.fixed_shares['father'] += self.residue
        self.residue = 0  # Fully distributed

    def _give_residue_to_grandfather(self):
        """If no children or grandchildren exist, the grandfather inherits all residue."""
        self.fixed_shares['grandfather'] += self.residue
        self.residue = 0

    def _give_residue_to_daughters(self):
        """If no sons exist, the father and daughter(s) share residue."""
        key = 'daughter' if self.daughters == 1 else 'daughters'
        self.fixed_shares[key] += self.residue
        self.residue = 0  # Fully distributed

    def _distribute_to_siblings(self):
        """Distribute residue among brothers with a 2:1 ratio."""
        total_shares = (2 * self.brothers) + (1 * self.sisters)
        share_per_unit = self.residue / total_shares
        self.results['each_brother'] = 2 * share_per_unit if self.brothers else 0
        self.results['each_sister'] = 1 * share_per_unit if self.sisters else 0
        self.residue = 0

    def _distribute_to_brothers(self):
        """Distribute residue to brothers only"""
        self.results['each_brother'] = self.residue / self.brothers
        self.residue = 0
    
    

    def plot_inheritance_tree(self):
        """Generate a structured decision tree with heir counts and blocking reasons."""
        G = nx.DiGraph()

        # Add root node (Deceased)
        G.add_node("Deceased", subset=0, color="red", label="Deceased")

        # Define colors for inheritance status
        heir_color = "green"  # Fixed share heirs
        residual_color = "green"  # Residual heirs (Asaba)
        blocked_color = "gray"  # Blocked heirs

        # Categorize heirs into groups
        fixed_heirs = []
        residual_heirs = []
        blocked_heirs = []

        # Add fixed share heirs (e.g., father, mother, spouse)
        for heir, amount in self.fixed_shares.items():
            count = getattr(self, heir, 1)  # Get the count of heirs
            heir_label = f"{heir.capitalize()} \n({count})"  # Format as "Father (1)"
            
            G.add_node(heir, subset=1, color=heir_color, label=heir_label)
            G.add_edge("Deceased", heir, label=f"${amount:,.2f}")
            fixed_heirs.append(heir)

        # Add residual heirs (Asaba - Sons, Daughters, etc.)
        for heir, amount in self.results.items():
            if heir.startswith("each_"):  # Check for Asaba heirs
                base_heir = heir.replace("each_", "")
                count = getattr(self, base_heir + "s", 1)  # Get heir count dynamically
                heir_label = f"{base_heir.capitalize()} \n({count})"  # Format as "Son (2)"
                
                G.add_node(base_heir, subset=2, color=residual_color, label=heir_label)
                G.add_edge("Deceased", base_heir, label=f"${amount:,.2f}")
                residual_heirs.append(base_heir)

        # Add blocked heirs with reasons
        for heir, reason in self.blocked_heirs.items():
            count = getattr(self, heir, 1)  # Get heir count dynamically
            heir_label = f"{heir.capitalize()}"  # Format as "Brothers (2) ❌"
            
            G.add_node(heir, subset=3, color=blocked_color, label=heir_label)
            G.add_edge("Deceased", heir, label="BLOCKED")
            blocked_heirs.append(heir)

        # Assign subset attributes to nodes for multipartite layout
        node_labels = nx.get_node_attributes(G, "label")
        subset_dict = nx.get_node_attributes(G, "subset")

        try:
            pos = nx.multipartite_layout(G, subset_key="subset")  # Structured layout
        except:
            pos = nx.shell_layout(G)  # Fallback to shell layout if needed

        # Draw the tree
        plt.figure(figsize=(12, 8))
        node_colors = [G.nodes[n]["color"] for n in G.nodes]

        nx.draw(G, pos, labels=node_labels, with_labels=True, node_size=3000, node_color=node_colors, edge_color="black", font_size=10, font_weight="bold")
        
        # Add edge labels for better readability
        edge_labels = {(u, v): G.edges[u, v]["label"] for u, v in G.edges}
        nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=9, bbox=dict(facecolor="white", edgecolor="none", alpha=0.6))

        plt.title("Structured Islamic Inheritance Decision Tree")
        plt.show()

   


    def plot_inheritance_pie_chart(self):
        """Generate a pie chart to visualize inheritance distribution with amounts, percentages, and counts."""

        # Prepare data: Remove blocked heirs and Wasiya (Will)
        data = {heir: amount for heir, amount in self.fixed_shares.items() if heir != "will"}

        # Add Residual Shares (Asaba)
        for heir, amount in self.results.items():
            if heir.startswith("each_"):  # Residual heirs
                base_heir = heir.replace("each_", "")
                count = getattr(self, base_heir + "s", 1)  # Get the correct count
                total_amount = amount * count  # Multiply by count for total share
                data[base_heir] = total_amount

        # Ensure there is data to plot
        total_distributed = sum(data.values())
        if total_distributed == 0:
            print("No valid inheritance distribution to display.")
            return

        # **Convert keys to proper labels**
        labels = []
        sizes = []

        for heir, amount in data.items():
            count = getattr(self, heir + "s", 1)  # Get correct count (plural)
            percentage = (amount / total_distributed) * 100  # Calculate percentage

            # Format label with count, amount, and percentage
            labels.append(f"{heir.capitalize()} (Count: {count})\n${amount:,.2f} ({percentage:.1f}%)")
            sizes.append(amount)

        # **Plot Pie Chart**
        plt.figure(figsize=(9, 9))
        wedges, texts, autotexts = plt.pie(
            sizes, labels=labels, autopct='%1.1f%%', startangle=140, 
            colors=plt.cm.Paired.colors, textprops={'fontsize': 10}
        )

        # **Customize text appearance**
        for text, autotext in zip(texts, autotexts):
            text.set_fontsize(10)  # Set heir labels font size
            autotext.set_fontsize(10)  # Set percentage labels font size

        plt.title("Inheritance Distribution Pie Chart", fontsize=12)
        plt.axis('equal')  # Ensures a circular pie chart
        plt.show()
    
        
# ------------------ Example Usage ------------------
# net_worth = 1000000  # Estate value
# inheritance_system = InheritanceSystem(
#     net_worth=net_worth,
#     will=100000,
#     father=0, mother=1, husband=1, wife=0, sons=1, daughters=0, 
#     brothers=2, grandsons=0, granddaughters=0, grandfather=0, sisters = 1
# )

# # Compute inheritance and display results
# inheritance_results = inheritance_system.compute_inheritance()
# inheritance_system.display_results()
# inheritance_system.plot_inheritance_tree()  # Visualize the inheritance tree
# inheritance_system.plot_inheritance_pie_chart()  # Visualize inheritance distribution
#------------------------------------------------------ 
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python Islamic_RBS.py <user_id>")
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

    # Find InheritanceSystem ID (Islamic System)
    connection = connect_db()
    cursor = connection.cursor()
    cursor.execute("SELECT idInheritanceSystem FROM InheritanceSystem WHERE system_name = %s", ("Islamic Inheritance",))
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
        grandfather=user_data.get("paternal_grandfather", 0),
        grandmother=user_data.get("paternal_grandmother", 0)
    )

    inheritance_results = inheritance_system.compute_inheritance()
    # inheritance_results = inheritance_system.compute_inheritance()
    json_result = json.dumps(inheritance_results)
    results_for_db = inheritance_system.get_results_for_db()

    # Store Results in the Database
    store_results_in_db(user_id, facts_id, inheritance_system_id, json_result, results_for_db)
    
    # Print JSON Output for Debugging
    # print("==========================================")
    # print(json_result)
    # print("==========================================")
    # print(json.dumps(results_for_db, indent=4))















    # # if len(sys.argv) != 2:
    # #     print("Usage: python Islamic_RBS.py <user_id>")
    # #     sys.exit(1)

    # # user_id = sys.argv[1]
    # user_id = 2

    # # Fetch inheritance data from database
    # data = get_user_inheritance_data(user_id)

    # # Initialize the inheritance system using fetched data
    # inheritance_system = InheritanceSystem(
    #     net_worth=data.get("networth", 0),
    #     will=data.get("will_amount", 0),
    #     father=data.get("father", 0),
    #     mother=data.get("mother", 0),
    #     husband=data.get("husband", 0),
    #     wife=data.get("wife", 0),
    #     sons=data.get("sons", 0),
    #     daughters=data.get("daughters", 0),
    #     brothers=data.get("brothers", 0),
    #     sisters=data.get("sisters", 0),
    #     grandsons=data.get("grandsons", 0),
    #     granddaughters=data.get("granddaughters", 0),
    #     grandfather=data.get("paternal_grandfather", 0),
    #     grandmother=data.get("paternal_grandmother", 0)
    # )

    # # Compute inheritance
    # inheritance_results = inheritance_system.compute_inheritance()
    # results_for_db = inheritance_system.get_results_for_db()

    # # Output results as JSON
    # print(json.dumps(results_for_db))
   
    # if len(sys.argv) != 2:
    #     print("Usage: python Islamic_RBS.py <json_data>")
    #     sys.exit(1)

    # json_data = sys.argv[1]
    # data = json.loads(json_data)

    # net_worth = data.get("net_worth", 0)
    # inheritance_system = InheritanceSystem(
    #     net_worth=net_worth,
    #     will=data.get("will", 0),
    #     father=data.get("father", 0),
    #     mother=data.get("mother", 0),
    #     husband=data.get("husband", 0),
    #     wife=data.get("wife", 0),
    #     sons=data.get("sons", 0),
    #     daughters=data.get("daughters", 0),
    #     brothers=data.get("brothers", 0),
    #     sisters=data.get("sisters", 0),
    #     grandsons=data.get("grandsons", 0),
    #     granddaughters=data.get("granddaughters", 0),
    #     grandfather=data.get("grandfather", 0),
    #     grandmother=data.get("grandmother", 0)
    # )

    # # Compute inheritance and return results as JSON
    # inheritance_results = inheritance_system.compute_inheritance()
    # print(json.dumps(inheritance_results))