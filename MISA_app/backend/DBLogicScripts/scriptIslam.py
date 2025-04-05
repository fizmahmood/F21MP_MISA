#DB Logic Script for Islamic Inheritance Calculation
import sys
import json

from decimal import Decimal 
        
#---------------------------------------------------------------------------------------------------------
# InheritanceSystem
#--------------------------------------------------------------------------------------------------------
    
class InheritanceSystem:
    def __init__(self, net_worth, father=0, mother=0, husband=0, wife=0,
                 sons=0, daughters=0, brothers=0, sisters=0, grandsons=0, granddaughters=0, 
                 paternal_grandfather=0, paternal_grandmother=0, maternal_grandfather=0, maternal_grandmother=0, will = 0):
        self.original_net_worth = net_worth
        self.net_worth = net_worth
        self.father = father
        self.mother = mother
        self.husband = husband
        self.wife = wife
        self.sons = sons
        self.daughters = daughters or 0 # Default to 0 if None
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
        

        # Brothers and sisters are blocked if father or grandfather exists
        if self.father > 0 :
            if self.brothers > 0:
                self.blocked_heirs['brothers'] = "Brothers are blocked because the father."
                self.brothers = 0  
            if self.sisters > 0:
                self.blocked_heirs['sisters'] = "Sisters are blocked because the father."
                self.sisters = 0  

        # Grandsons and granddaughters are blocked if the deceased has children
        if self.sons > 0 or self.daughters > 0:
            if self.sons > 0:
                if self.brothers > 0:
                    self.blocked_heirs['brothers'] = "Brothers are blocked because of the presence of a son."
                    self.brothers = 0  
                if self.sisters > 0:
                    self.blocked_heirs['sisters'] = "Sisters are blocked because the of the presence of a son."
                    self.sisters = 0  
            if self.grandsons > 0:
                self.blocked_heirs['grandsons'] = "Grandsons are blocked because the deceased has children."
                self.grandsons = 0  # Block grandsons
            if self.granddaughters > 0:
                self.blocked_heirs['granddaughters'] = "Granddaughters are blocked because the deceased children."
                self.granddaughters = 0  # Block granddaughters

        # paternal_grandfather is blocked if the father is alive
        if self.father > 0 and (self.paternal_grandfather > 0 or self.paternal_grandmother > 0 or self.maternal_grandfather > 0 or self.maternal_grandmother > 0):
            self.blocked_heirs['paternal_grandfather'] = "Grandfather is blocked because the father is alive."
            self.paternal_grandfather = 0
            self.blocked_heirs['paternal_grandmother'] = "Grandmother is blocked because the father is alive."
            self.paternal_grandmother = 0
            self.blocked_heirs['maternal_grandfather'] = "Grandfather is blocked because the father is alive."
            self.maternal_grandfather = 0
            self.blocked_heirs['maternal_grandmother'] = "Grandmother is blocked because the father is alive."
            self.maternal_grandmother = 0

        # paternal_grandmother is blocked if mother is alive
        if self.mother > 0 and (self.paternal_grandmother > 0 or self.maternal_grandmother):
            self.blocked_heirs['paternal_grandmother'] = "Grandmother is blocked because the mother is alive."
            self.paternal_grandmother = 0
            self.blocked_heirs['maternal_grandmother'] = "Grandmother is blocked because the mother is alive."
            self.maternal_grandmother = 0
        
        


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
            self.explanations['father'] = "Father gets a fixed share of 1/6."

        if self.mother:
            if self.sons or self.daughters or self.grandsons or self.granddaughters:
                fixed_shares['mother'] = self._allocate_fixed_share('mother', 1 / 6)
                self.explanations['mother'] = "Mother gets a fixed share of 1/6 if the user has children"
            else:
                fixed_shares['mother'] = self._allocate_fixed_share('mother', 1 / 3)
                self.explanations['mother'] = "Mother gets a fixed share of 1/3 if the user has no children"

        if self.paternal_grandfather:
            fixed_shares['paternal_grandfather'] = self._allocate_fixed_share('paternal_grandfather', 1 / 6)
            self.explanations['paternal_grandfather'] = "Paternal Grandfather gets 1/6."

        if self.paternal_grandmother:
            if self.sons or self.daughters or self.grandsons or self.granddaughters:
                fixed_shares['paternal_grandmother'] = self._allocate_fixed_share('paternal_grandmother', 1 / 6)
            else:
                fixed_shares['paternal_grandmother'] = self._allocate_fixed_share('paternal_grandmother', 1 / 3)

        # Spouses
        if self.husband:
            if self.sons or self.daughters:
                fixed_shares['husband'] = self._allocate_fixed_share('husband', 1 / 4)
                self.explanations['husband'] = "Husband gets a fixed share of 1/4 if children are present."
            else:
                fixed_shares['husband'] = self._allocate_fixed_share('husband', 1 / 2)
                self.explanations['husband'] = "Husband gets a fixed share of 1/2 if children are present."

        if self.wife:
            if self.sons or self.daughters or self.grandsons or self.granddaughters:
                fixed_shares['wife'] = self._allocate_fixed_share('wife', 1 / 8)
                self.explanations['wife'] = "Wife gets a fixed share of 1/8 if children are present."
            else:
                fixed_shares['wife'] = self._allocate_fixed_share('wife', 1 / 4)
                self.explanations['wife'] = "Wife gets a fixed share of 1/4 if children are present."

        # Daughters (Only if no sons)
        if self.daughters > 0 and not self.sons:
            if self.daughters == 1:
                fixed_shares['daughters'] = self._allocate_fixed_share('daughters', 1 / 2)
                self.explanations['daughters'] = "Only child daughter gets a fixed share of 1/2."
            else:
                fixed_shares['daughters'] = self._allocate_fixed_share('daughters', 2 / 3)
                self.results['each_daughter'] = fixed_shares['daughters'] / self.daughters
                self.explanations['daughters'] = "Daughters share a fixed share of 2/3 equally."

        # Granddaughters (Only if no grandsons, no sons, and no daughters)
        if self.granddaughters and not self.grandsons and not self.sons and not self.daughters:
            if self.granddaughters == 1:
                fixed_shares['granddaughters'] = self._allocate_fixed_share('granddaughters', 1 / 2)
                self.explanations['granddaughters'] = "Only granddaughter gets a fixed share of 1/2."
            else:
                fixed_shares['granddaughters'] = self._allocate_fixed_share('granddaughters', 2 / 3)
                self.results['each_granddaughter'] = self.fixed_shares['granddaughters'] / self.granddaughters
                self.explanations['granddaughters'] = "Granddaughters share a fixed share of 2/3 equally."

        # Sisters (Only if no brothers)
        if self.sisters and not self.brothers:
            if self.sisters == 1:
                fixed_shares['sisters'] = self._allocate_fixed_share('sisters', 1 / 2)
                self.explanations['sisters'] = "Only sister gets a fixed share of 1/2."
            else:
                fixed_shares['sisters'] = self._allocate_fixed_share('sisters', 2 / 3)
                self.results['each_sister'] = self.fixed_shares['sisters'] / self.sisters
                self.explanations['sisters'] = "Sisters share a fixed share of 2/3 equally"

        # Compute total allocated before scaling
        total_fixed = sum(fixed_shares.values())

        # Apply proportional scaling if total fixed share exceeds available networh
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

        # **paternal_grandfather gets residue if no father, children, or grandchildren exist**
        elif self.paternal_grandfather:
            self._give_residue_to_grandfather()

        # **Brothers and Sisters (if no children, father, or paternal_grandfather)**
        elif self.brothers or self.sisters:
            self._distribute_to_siblings()

        # **Brothers alone (if no children, father, paternal_grandfather, or sisters)**
        elif self.brothers:
            self._distribute_to_brothers()

        # **Daughters get residue if no sons exist and father is alive**
        elif self.residue > 0 and self.father and self.daughters and not self.sons and not (self.brothers or self.sisters):
            self._give_residue_to_daughters()

        # elif self.residue > 0 and self.father and self.daughters and not self.sons:
        #     self._give_residue_to_daughters()

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
            self.explanations['each_son'] = "Each son gets 2 portions of the a daughter's share"
        if self.daughters:
            self.results['each_daughter'] = share_per_unit
            self.explanations['each_daughter'] = "Each daughter gets 1 portion of the residue"

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
        self.explanations['each_son'] = "Each son gets an equal share of the residue equally."

    def _give_residue_to_father(self):
        """If no children or grandchildren exist, the father inherits all residue."""
        self.fixed_shares['father'] += self.residue
        self.residue = 0  # Fully distributed
        self.explanations['father'] = "The father inherits the residue as there are no children"

    def _give_residue_to_grandfather(self):
        """If no children or grandchildren exist, the paternal_grandfather inherits all residue."""
        self.fixed_shares['paternal_grandfather'] += self.residue
        self.residue = 0
        self.explanations['paternal_grandfather'] = "The paternal grandfather inherits the residue"

    def _give_residue_to_daughters(self):
        """If no sons exist, the father and daughter(s) share residue."""
        key = 'daughter' if self.daughters == 1 else 'daughters'
        self.fixed_shares[key] += self.residue
        self.residue = 0  # Fully distributed
        self.explanations['daughters']= "The daughter(s) inherit the residue as there are no sons"

    def _distribute_to_siblings(self):
        """Distribute residue among brothers with a 2:1 ratio."""
        total_shares = (2 * self.brothers) + (1 * self.sisters)
        share_per_unit = self.residue / total_shares
        self.results['each_brother'] = 2 * share_per_unit if self.brothers else 0
        self.explanations['each_brother'] = "Each brother get 2 portions of the sister's share"
        self.results['each_sister'] = 1 * share_per_unit if self.sisters else 0
        self.explanations['each_sister'] = "Each sister gets 1 portion of the residue."
        self.residue = 0

    def _distribute_to_brothers(self):
        """Distribute residue to brothers only"""
        self.results['each_brother'] = self.residue / self.brothers
        self.residue = 0
        self.explanations['each_brother']="Brothers share the residue equally"
    
    
print("✅ Islamic Inheritance Script started...")

if "error" in user_facts:
    print("❌ user_facts is empty or invalid")
    json_result = {}
    results_for_db = {}
    context_info = "Error: user_facts missing"
else:
    print(f"✅ user_facts received: {user_facts}")

    inheritance_system = InheritanceSystem(
        net_worth=float(user_facts.get("networth", 0)),
        will=float(user_facts.get("will_amount", 0)),
        father=user_facts.get("father", 0),
        mother=user_facts.get("mother", 0),
        husband=user_facts.get("husband", 0),
        wife=user_facts.get("wife", 0),
        sons=user_facts.get("sons", 0),
        daughters=user_facts.get("daughters", 0),
        brothers=user_facts.get("brothers", 0),
        sisters=user_facts.get("sisters", 0),
        grandsons=user_facts.get("grandsons", 0),
        granddaughters=user_facts.get("granddaughters", 0),
        paternal_grandfather=user_facts.get("paternal_grandfather", 0),
        paternal_grandmother=user_facts.get("paternal_grandmother", 0),
        maternal_grandfather=user_facts.get("maternal_grandfather", 0),
        maternal_grandmother=user_facts.get("maternal_grandmother", 0)
    )

    print("✅ InheritanceSystem initialized successfully.")

    inheritance_results = inheritance_system.compute_inheritance()
    print(f"✅ Computed Inheritance Results: {inheritance_results}")

    json_result = inheritance_results
    results_for_db = inheritance_system.get_results_for_db()
    print(f"✅ Results for DB: {results_for_db}")

    context_info = "Islamic Inheritance System explanation text..."

print("✅ Islamic Inheritance Script finished successfully.")