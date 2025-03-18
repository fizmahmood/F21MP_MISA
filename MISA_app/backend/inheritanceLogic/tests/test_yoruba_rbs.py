import sys
import unittest
from unittest.mock import patch, MagicMock
from decimal import Decimal
import json
import os

# Add the parent directory to the path so we can import the module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from Yoruba_RBS import InheritanceSystem, connect_db, get_user_inheritance_data, store_results_in_db

class TestYorubaInheritanceSystem(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        self.net_worth = 1000000

    def test_initialization(self):
        """Test that the inheritance system initializes correctly."""
        system = InheritanceSystem(
            net_worth=self.net_worth,
            father=1,
            mother=1,
            sons=2,
            daughters=1
        )
        
        self.assertEqual(system.original_net_worth, self.net_worth)
        self.assertEqual(system.net_worth, self.net_worth)
        self.assertEqual(system.father, 1)
        self.assertEqual(system.mother, 1)
        self.assertEqual(system.sons, 2)
        self.assertEqual(system.daughters, 1)
        self.assertEqual(system.husband, 0)  # Default value
        self.assertEqual(system.will, 0)  # Default value

    def test_blocking_rules_children_block_others(self):
        """Test that children block other relatives."""
        system = InheritanceSystem(
            net_worth=self.net_worth,
            father=1,
            mother=1,
            sons=1,
            brothers=2,
            sisters=1,
            paternal_grandfather=1,
            paternal_grandmother=1,
            maternal_grandfather=1,
            maternal_grandmother=1,
            grandsons=1,
            granddaughters=1
        )
        
        system._apply_blocking_rules()
        
        # Father should be blocked by children
        self.assertEqual(system.father, 0)
        self.assertIn("father", system.blocked_heirs)
        
        # Brothers and sisters should be blocked by children
        self.assertEqual(system.brothers, 0)
        self.assertEqual(system.sisters, 0)
        self.assertIn("brothers", system.blocked_heirs)
        self.assertIn("sisters", system.blocked_heirs)
        
        # Grandparents should be blocked by children
        self.assertEqual(system.paternal_grandfather, 0)
        self.assertIn("paternal grandfather", system.blocked_heirs)
        
        # Grandchildren should be blocked by children
        self.assertEqual(system.grandsons, 0)
        self.assertEqual(system.granddaughters, 0)
        self.assertIn("grandsons", system.blocked_heirs)
        self.assertIn("granddaughters", system.blocked_heirs)

    def test_blocking_rules_father_blocks_siblings(self):
        """Test that father blocks siblings when no children."""
        system = InheritanceSystem(
            net_worth=self.net_worth,
            father=1,
            brothers=2,
            sisters=1
        )
        
        system._apply_blocking_rules()
        
        # Brothers and sisters should be blocked by father
        self.assertEqual(system.brothers, 0)
        self.assertEqual(system.sisters, 0)
        self.assertIn("brothers", system.blocked_heirs)
        self.assertIn("sisters", system.blocked_heirs)

    def test_blocking_rules_spouse_blocked(self):
        """Test that spouse is blocked as they're not considered bloodline."""
        system = InheritanceSystem(
            net_worth=self.net_worth,
            husband=1,
            wife=1
        )
        
        system._apply_blocking_rules()
        
        # Spouse should be blocked
        self.assertEqual(system.husband, 0)
        self.assertEqual(system.wife, 0)
        self.assertIn("husband", system.blocked_heirs)
        self.assertIn("wife", system.blocked_heirs)

    def test_inheritance_father_mother(self):
        """Test inheritance calculation with father and mother."""
        system = InheritanceSystem(
            net_worth=self.net_worth,
            father=1,
            mother=1
        )
        
        results = system.compute_inheritance()
        
        # Father should get 2/3, mother 1/3
        self.assertEqual(results["father"], self.net_worth * 2/3)
        self.assertEqual(results["mother"], self.net_worth * 1/3)

    def test_inheritance_mother_and_siblings(self):
        """Test inheritance calculation with mother and siblings."""
        system = InheritanceSystem(
            net_worth=self.net_worth,
            mother=1,
            brothers=1
        )
        
        results = system.compute_inheritance()
        
        # Mother should get 2/3, brother 1/3 when only one sibling
        self.assertEqual(results["mother"], self.net_worth * 2/3)
        self.assertEqual(results["each_brother"], self.net_worth * 1/3)

    def test_inheritance_multiple_siblings(self):
        """Test inheritance calculation with multiple siblings."""
        system = InheritanceSystem(
            net_worth=self.net_worth,
            brothers=2,
            sisters=1
        )
        
        results = system.compute_inheritance()
        
        # Each sibling should get equal share
        expected_share = self.net_worth / 3
        self.assertEqual(results["each_brother"], expected_share)
        self.assertEqual(results["each_sister"], expected_share)

    def test_inheritance_children(self):
        """Test inheritance calculation with children."""
        system = InheritanceSystem(
            net_worth=self.net_worth,
            sons=2,
            daughters=1
        )
        
        results = system.compute_inheritance()
        
        # Each child should get equal share
        expected_share = self.net_worth / 3
        self.assertEqual(results["each_son"], expected_share)
        self.assertEqual(results["each_daughter"], expected_share)

    def test_get_results_for_db(self):
        """Test the formatting of results for database storage."""
        system = InheritanceSystem(
            net_worth=self.net_worth,
            sons=2,
            daughters=1
        )
        
        system.compute_inheritance()
        db_results = system.get_results_for_db()
        
        # Check structure and values
        self.assertEqual(db_results["original_net_worth"], float(self.net_worth))
        self.assertEqual(db_results["net_worth"], float(self.net_worth))
        self.assertEqual(len(db_results["heirs"]), 2)  # sons and daughters
        
        # Check heirs data
        for heir in db_results["heirs"]:
            if heir["heir"] == "son":
                self.assertEqual(heir["count"], 2)
                self.assertEqual(heir["amount"], float(self.net_worth / 3))
            elif heir["heir"] == "daughter":
                self.assertEqual(heir["count"], 1)
                self.assertEqual(heir["amount"], float(self.net_worth / 3))

    @patch('Yoruba_RBS.mysql.connector.connect')
    def test_connect_db(self, mock_connect):
        """Test database connection function."""
        mock_connection = MagicMock()
        mock_connect.return_value = mock_connection
        
        connection = connect_db()
        
        # Check that connection was established
        mock_connect.assert_called_once()
        self.assertEqual(connection, mock_connection)

    @patch('Yoruba_RBS.connect_db')
    def test_get_user_inheritance_data(self, mock_connect_db):
        """Test retrieving user data from database."""
        # Setup mock connection and cursor
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connect_db.return_value = mock_connection
        mock_connection.cursor.return_value = mock_cursor
        
        # Setup mock data return
        mock_data = {"user_id": 1, "networth": 1000000}
        mock_cursor.fetchone.return_value = mock_data
        
        # Call function
        result = get_user_inheritance_data(1)
        
        # Verify results
        mock_connect_db.assert_called_once()
        mock_cursor.execute.assert_called_once()
        self.assertEqual(result, mock_data)

    @patch('Yoruba_RBS.connect_db')
    def test_store_results_in_db(self, mock_connect_db):
        """Test storing results in database."""
        # Setup mock connection and cursor
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connect_db.return_value = mock_connection
        mock_connection.cursor.return_value = mock_cursor
        
        # Test data
        user_id = 1
        facts_id = 1
        inheritance_system_id = 1
        results_for_db = {"heirs": []}
        detailed_results = {"explanation": "test"}
        
        # Call function
        store_results_in_db(user_id, facts_id, inheritance_system_id, results_for_db, detailed_results)
        
        # Verify results
        mock_connect_db.assert_called_once()
        mock_cursor.execute.assert_called_once()
        mock_connection.commit.assert_called_once()

if __name__ == '__main__':
    unittest.main() 