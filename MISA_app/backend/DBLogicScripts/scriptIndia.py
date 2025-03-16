#DB Logic Script for India Inheritance Calculation
import sys
import json
from decimal import Decimal

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
        if self.sons > 0 or self.daughters > 0 or self.grandsons > 0 or self.granddaughters > 0:
            if self.father > 0:
                self.blocked_heirs["father"] = "Father is blocked due to presence of direct descendants."
                self.father = 0

            if self.mother > 0:
                self.blocked_heirs["mother"] = "Mother is blocked due to presence of direct descendants."
                self.mother = 0

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
        
        if (self.father > 0 or self.mother > 0 or self.paternal_grandfather
            > 0 or self.paternal_grandmother > 0 or self.maternal_grandfather > 0 or self.maternal_grandmother > 0 or self.brothers > 0 or self.sisters > 0):
            if self.father > 0:
                if self.mother > 0:
                    self.blocked_heirs["mother"] = "Mother is blocked because of the presence of father."
                    self.mother = 0
                if self.brothers > 0:
                    self.blocked_heirs["brothers"] = "Brother is blocked because of the presence of father."
                    self.brothers = 0
                if self.sisters > 0:
                    self.blocked_heirs["sisters"] = "Sister is blocked because of the presence of father."
                    self.sisters = 0
                if self.paternal_grandfather > 0:
                    self.blocked_heirs["paternal_grandfather"] = "Paternal Grandfather is blocked because of the presence of father."
                    self.paternal_grandfather = 0
                if self.paternal_grandmother > 0:
                    self.blocked_heirs["paternal_grandmother"] = "Paternal Grandmother is blocked because of the presence of father."
                    self.paternal_grandmother = 0
                if self.maternal_grandfather > 0:
                    self.blocked_heirs["maternal_grandfather"] = "Maternal Grandfather is blocked because of the presence of father."
                    self.maternal_grandfather = 0
                if self.maternal_grandmother > 0:
                    self.blocked_heirs["maternal_grandmother"] = "Maternal Grandmother is blocked because of the presence of father."
                    self.maternal_grandmother = 0
            
            if (self.mother or self.brothers or self.sisters):
                if self.paternal_grandfather > 0:
                    self.blocked_heirs["paternal_grandfather"] = "Paternal Grandfather is blocked because of the presence of mother and/or siblings."
                    self.paternal_grandfather = 0
                if self.paternal_grandmother > 0:
                    self.blocked_heirs["paternal_grandmother"] = "Paternal Grandmother is blocked because of the presence of mother and/or siblings."
                    self.paternal_grandmother = 0
                if self.maternal_grandfather > 0:
                    self.blocked_heirs["maternal_grandfather"] = "Maternal Grandfather is blocked because of the presence of mother and/or siblings."
                    self.maternal_grandfather = 0
                if self.maternal_grandmother > 0:
                    self.blocked_heirs["maternal_grandmother"] = "Maternal Grandmother is blocked because of the presence of mother and/or siblings."
                    self.maternal_grandmother = 0
            



    def _calculate_shares(self):
        """Distribute remaining inheritance equally among all eligible heirs."""
        
        eligible_heirs = {}
        total_heirs = 0  # Count of all eligible heirs

        # ✅ Exclude non-heir attributes
        exclude_keys = {
            "original_net_worth", "net_worth", "will", "fixed_shares", "residue",
            "results", "blocked_heirs", "explanations"
        }
        
        if self.husband > 0 and (self.sons > 0 or self.daughters > 0):
            self.fixed_shares["husband"] = self.net_worth * 1/3
            self.explanations["husband"] = "Husband inherits 1/3 of the estate, as there are direct descendants."
            # self.net_worth -= self.net_worth * 1/4
        
        if self.wife > 0 and (self.sons > 0 or self.daughters > 0):
            self.fixed_shares["wife"] = self.net_worth * 1/3
            self.explanations["wife"] = "Wife inherits 1/3 of the estate, as there are direct descendants."
            # self.net_worth -= self.net_worth * 1/4

        if self.husband > 0 and (self.father > 0 or self.mother > 0 or 
                                 self.paternal_grandfather or self.paternal_grandmother or self.maternal_grandfather 
                                 or self.maternal_grandmother):
            self.fixed_shares["husband"] = self.net_worth * 1/2
            self.explanations["husband"] = "Husband inherits 1/2 of the estate, as there are no direct descendants."

        if self.wife > 0 and (self.father > 0 or self.mother > 0 or 
                                 self.paternal_grandfather or self.paternal_grandmother or self.maternal_grandfather 
                                 or self.maternal_grandmother or self.brothers > 0 or self.sisters > 0):
            self.fixed_shares["wife"] = self.net_worth * 1/2
            self.explanations["wife"] = "Wife inherits 1/2 of the estate, as there are no direct descendants."
        
        self.residue = self.net_worth - sum(self.fixed_shares.values())



        if self.sons > 0 or self.daughters > 0 or self.grandsons > 0 or self.granddaughters > 0:
            total_descendants = self.sons + self.daughters + self.grandsons + self.granddaughters
            if total_descendants > 0:
                share_per_descendant = self.residue / total_descendants
                if self.sons > 0:
                    self.fixed_shares["each_son"] = share_per_descendant
                
                if self.daughters > 0:
                    self.fixed_shares["each_daughter"] = share_per_descendant
                
                if self.grandsons > 0:
                    self.fixed_shares["each_grandson"] = share_per_descendant

                if self.granddaughters > 0:
                    self.fixed_shares["each_granddaughter"] = share_per_descendant

        
        if (self.father > 0 or self.mother > 0 or self.paternal_grandfather > 0 or
             self.paternal_grandmother > 0 or self.maternal_grandfather > 0 
             or self.maternal_grandmother > 0 or self.brothers > 0 or self.sisters > 0):
            total_ascendants = self.father + self.mother + self.paternal_grandfather + self.paternal_grandmother + self.maternal_grandfather + self.maternal_grandmother
            if total_ascendants > 0:
                share_per_ascendant = self.residue / total_ascendants
                if self.father > 0:
                    self.fixed_shares["father"] = share_per_ascendant
                if self.mother > 0:
                    self.fixed_shares["mother"] = share_per_ascendant
                if self.paternal_grandfather > 0:
                    self.fixed_shares["paternal_grandfather"] = share_per_ascendant
                if self.paternal_grandmother > 0:
                    self.fixed_shares["paternal_grandmother"] = share_per_ascendant
                if self.maternal_grandfather > 0:
                    self.fixed_shares["maternal_grandfather"] = share_per_ascendant
                if self.maternal_grandmother > 0:
                    self.fixed_shares["maternal_grandmother"] = share_per_ascendant
                if self.brothers > 0:
                    self.fixed_shares["each_brother"] = share_per_ascendant
                if self.sisters > 0:
                    self.fixed_shares["each_sister"] = share_per_ascendant

        


#---------------------------------------------------------------------------------------------------------
# Execution Output
#--------------------------------------------------------------------------------------------------------


if "error" in user_facts:
    print("❌ user_facts is empty or invalid")
    json_result = {}
    results_for_db = {}
    context_info = "Error: user_facts missing"
else:
    print(f"✅ user_facts received: {user_facts}")

    inheritance_system = InheritanceSystem(
    net_worth=float(user_facts.get("networth", 0)),  # Convert Decimal to float
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

    inheritance_results = inheritance_system.compute_inheritance()
    json_result = json.dumps(inheritance_results)
    results_for_db = inheritance_system.get_results_for_db()
    context_info = """
The India inheritance system is based on the Indian Succession Act, 1925. The act applies to all Indian citizens. However, the act does not apply to Muslims, and Hindus. The heirs are classified into two categories: Class I heirs and Class II heirs. The Class I heirs are given priority over the Class II heirs. The Class I heirs include the widow, sons, daughters, and mother. The Class II heirs include the father, siblings, nephews, nieces and more."""
    
    output = {
        "json_result": json_result,
        "results_for_db": results_for_db,
        "context_info": context_info

    }
    print(json.dumps(output))