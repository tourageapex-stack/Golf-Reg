#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for ILWU Local 4 Golf Tournament
Tests all endpoints including registration, admin functionality, and team management
"""

import requests
import sys
import json
import random
import string
from datetime import datetime
from typing import Dict, List, Optional

class GolfTournamentAPITester:
    def __init__(self, base_url="https://golf-team-signup.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.admin_auth = ("admin", "ilwu4golf2024")
        self.tests_run = 0
        self.tests_passed = 0
        self.registered_players = []
        self.registered_teams = []
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Optional[Dict] = None, auth: Optional[tuple] = None) -> tuple:
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, auth=auth)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, auth=auth)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, auth=auth)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "ERROR")
                try:
                    error_detail = response.json()
                    self.log(f"   Error details: {error_detail}", "ERROR")
                except:
                    self.log(f"   Response text: {response.text[:200]}", "ERROR")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Exception: {str(e)}", "ERROR")
            return False, {}

    def generate_test_player(self, prefix: str = "Test") -> Dict:
        """Generate test player data"""
        suffix = ''.join(random.choices(string.digits, k=4))
        return {
            "first_name": f"{prefix}Player{suffix}",
            "last_name": f"User{suffix}",
            "phone": f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "email": f"test{suffix}@example.com",
            "association": random.choice(["Local 4", "Local 8", "Local 19", "friend"])
        }

    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        self.log("=== Testing Basic Connectivity ===")
        success, data = self.run_test("API Root", "GET", "", 200)
        if success:
            self.log(f"API Message: {data.get('message', 'No message')}")
        return success

    def test_tournament_info(self):
        """Test tournament information endpoint"""
        self.log("=== Testing Tournament Info ===")
        success, data = self.run_test("Tournament Info", "GET", "tournament-info", 200)
        if success:
            required_fields = ["location", "price_per_player", "price_per_team", "max_teams", "max_players_per_team"]
            for field in required_fields:
                if field not in data:
                    self.log(f"❌ Missing required field: {field}", "ERROR")
                    return False
            self.log(f"✅ Tournament at {data['location']}, ${data['price_per_player']}/player")
            self.log(f"   Current: {data['current_teams']} teams, {data['current_players']} players")
        return success

    def test_individual_registration(self):
        """Test individual player registration"""
        self.log("=== Testing Individual Registration ===")
        
        # Test valid registration
        player_data = self.generate_test_player("Individual")
        success, response = self.run_test(
            "Individual Registration", 
            "POST", 
            "register/individual", 
            200, 
            player_data
        )
        
        if success:
            required_fields = ["success", "team_number", "player_ids"]
            for field in required_fields:
                if field not in response:
                    self.log(f"❌ Missing response field: {field}", "ERROR")
                    return False
            
            self.log(f"✅ Player registered to Team {response['team_number']}")
            self.log(f"   Captain status: {response.get('is_captain', False)}")
            self.registered_players.extend(response['player_ids'])
            
            # Test invalid registration (missing fields)
            invalid_data = {"first_name": "Test", "last_name": "User"}
            self.run_test(
                "Individual Registration (Invalid)", 
                "POST", 
                "register/individual", 
                422,  # Validation error
                invalid_data
            )
        
        return success

    def test_team_registration(self):
        """Test team registration with multiple players"""
        self.log("=== Testing Team Registration ===")
        
        # Test with 2 players
        team_data = {
            "players": [
                self.generate_test_player("TeamCaptain"),
                self.generate_test_player("TeamMember")
            ]
        }
        
        success, response = self.run_test(
            "Team Registration (2 players)", 
            "POST", 
            "register/team", 
            200, 
            team_data
        )
        
        if success:
            required_fields = ["success", "team_number", "player_ids"]
            for field in required_fields:
                if field not in response:
                    self.log(f"❌ Missing response field: {field}", "ERROR")
                    return False
            
            self.log(f"✅ Team registered as Team {response['team_number']}")
            self.log(f"   Players registered: {len(response['player_ids'])}")
            self.registered_players.extend(response['player_ids'])
            self.registered_teams.append(response['team_number'])
            
            # Test with 4 players (full team)
            full_team_data = {
                "players": [
                    self.generate_test_player(f"FullTeam{i}") for i in range(1, 5)
                ]
            }
            
            success2, response2 = self.run_test(
                "Team Registration (4 players)", 
                "POST", 
                "register/team", 
                200, 
                full_team_data
            )
            
            if success2:
                self.log(f"✅ Full team registered as Team {response2['team_number']}")
                self.registered_players.extend(response2['player_ids'])
                self.registered_teams.append(response2['team_number'])
            
            # Test invalid team (too many players)
            invalid_team = {
                "players": [self.generate_test_player(f"Invalid{i}") for i in range(1, 6)]
            }
            self.run_test(
                "Team Registration (Invalid - 5 players)", 
                "POST", 
                "register/team", 
                400, 
                invalid_team
            )
        
        return success

    def test_public_teams_view(self):
        """Test public teams viewing endpoint"""
        self.log("=== Testing Public Teams View ===")
        success, data = self.run_test("Get All Teams", "GET", "teams", 200)
        
        if success and isinstance(data, list):
            self.log(f"✅ Retrieved {len(data)} teams")
            for team in data[:2]:  # Check first 2 teams
                required_fields = ["team_number", "players", "is_full", "spots_remaining"]
                for field in required_fields:
                    if field not in team:
                        self.log(f"❌ Team missing field: {field}", "ERROR")
                        return False
                self.log(f"   Team {team['team_number']}: {len(team['players'])} players, {team['spots_remaining']} spots left")
        
        return success

    def test_admin_authentication(self):
        """Test admin authentication"""
        self.log("=== Testing Admin Authentication ===")
        
        # Test valid credentials
        success, data = self.run_test(
            "Admin Verify (Valid)", 
            "GET", 
            "admin/verify", 
            200, 
            auth=self.admin_auth
        )
        
        if success:
            self.log(f"✅ Admin authenticated as: {data.get('username', 'Unknown')}")
        
        # Test invalid credentials
        self.run_test(
            "Admin Verify (Invalid)", 
            "GET", 
            "admin/verify", 
            401, 
            auth=("wrong", "credentials")
        )
        
        return success

    def test_admin_dashboard(self):
        """Test admin dashboard statistics"""
        self.log("=== Testing Admin Dashboard ===")
        success, data = self.run_test(
            "Admin Dashboard Stats", 
            "GET", 
            "admin/dashboard", 
            200, 
            auth=self.admin_auth
        )
        
        if success:
            required_fields = ["total_players", "total_teams", "teams_full", "spots_remaining"]
            for field in required_fields:
                if field not in data:
                    self.log(f"❌ Dashboard missing field: {field}", "ERROR")
                    return False
            
            self.log(f"✅ Dashboard stats:")
            self.log(f"   Total Players: {data['total_players']}")
            self.log(f"   Total Teams: {data['total_teams']}")
            self.log(f"   Full Teams: {data['teams_full']}")
            self.log(f"   Spots Remaining: {data['spots_remaining']}")
        
        return success

    def test_admin_teams_view(self):
        """Test admin teams view"""
        self.log("=== Testing Admin Teams View ===")
        success, data = self.run_test(
            "Admin Teams View", 
            "GET", 
            "admin/teams", 
            200, 
            auth=self.admin_auth
        )
        
        if success and isinstance(data, list):
            self.log(f"✅ Admin retrieved {len(data)} teams")
        
        return success

    def test_admin_players_view(self):
        """Test admin players view"""
        self.log("=== Testing Admin Players View ===")
        success, data = self.run_test(
            "Admin Players View", 
            "GET", 
            "admin/players", 
            200, 
            auth=self.admin_auth
        )
        
        if success and isinstance(data, list):
            self.log(f"✅ Admin retrieved {len(data)} players")
            # Check if any player has captain status
            captains = [p for p in data if p.get('is_captain', False)]
            self.log(f"   Found {len(captains)} team captains")
        
        return success

    def test_admin_delete_operations(self):
        """Test admin delete operations"""
        self.log("=== Testing Admin Delete Operations ===")
        
        if not self.registered_players:
            self.log("⚠️ No registered players to test deletion", "WARNING")
            return True
        
        # Test delete player
        player_id = self.registered_players[0]
        success = self.run_test(
            "Delete Player", 
            "DELETE", 
            f"admin/player/{player_id}", 
            200, 
            auth=self.admin_auth
        )[0]
        
        if success:
            self.log(f"✅ Successfully deleted player {player_id}")
        
        # Test delete non-existent player
        self.run_test(
            "Delete Non-existent Player", 
            "DELETE", 
            "admin/player/non-existent-id", 
            404, 
            auth=self.admin_auth
        )
        
        return success

    def test_team_number_uniqueness(self):
        """Test that team numbers are unique and within range 1-18"""
        self.log("=== Testing Team Number Uniqueness ===")
        
        # Get all teams
        success, teams = self.run_test("Get Teams for Number Check", "GET", "teams", 200)
        
        if success and isinstance(teams, list):
            team_numbers = [team['team_number'] for team in teams]
            unique_numbers = set(team_numbers)
            
            # Check uniqueness
            if len(team_numbers) == len(unique_numbers):
                self.log("✅ All team numbers are unique")
            else:
                self.log("❌ Duplicate team numbers found!", "ERROR")
                return False
            
            # Check range
            invalid_numbers = [n for n in team_numbers if n < 1 or n > 18]
            if not invalid_numbers:
                self.log("✅ All team numbers are in valid range (1-18)")
            else:
                self.log(f"❌ Invalid team numbers found: {invalid_numbers}", "ERROR")
                return False
            
            self.log(f"   Team numbers in use: {sorted(team_numbers)}")
        
        return success

    def run_all_tests(self):
        """Run all test suites"""
        self.log("🚀 Starting ILWU Local 4 Golf Tournament API Tests")
        self.log(f"Testing against: {self.base_url}")
        
        test_results = []
        
        # Run test suites
        test_suites = [
            ("Basic Connectivity", self.test_basic_connectivity),
            ("Tournament Info", self.test_tournament_info),
            ("Individual Registration", self.test_individual_registration),
            ("Team Registration", self.test_team_registration),
            ("Public Teams View", self.test_public_teams_view),
            ("Admin Authentication", self.test_admin_authentication),
            ("Admin Dashboard", self.test_admin_dashboard),
            ("Admin Teams View", self.test_admin_teams_view),
            ("Admin Players View", self.test_admin_players_view),
            ("Team Number Uniqueness", self.test_team_number_uniqueness),
            ("Admin Delete Operations", self.test_admin_delete_operations),
        ]
        
        for suite_name, test_func in test_suites:
            try:
                result = test_func()
                test_results.append((suite_name, result))
            except Exception as e:
                self.log(f"❌ {suite_name} failed with exception: {str(e)}", "ERROR")
                test_results.append((suite_name, False))
        
        # Print summary
        self.log("\n" + "="*60)
        self.log("📊 TEST SUMMARY")
        self.log("="*60)
        
        passed_suites = sum(1 for _, result in test_results if result)
        total_suites = len(test_results)
        
        for suite_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status} {suite_name}")
        
        self.log(f"\nOverall Results:")
        self.log(f"  Test Suites: {passed_suites}/{total_suites} passed")
        self.log(f"  Individual Tests: {self.tests_passed}/{self.tests_run} passed")
        self.log(f"  Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.registered_players:
            self.log(f"\nTest Data Created:")
            self.log(f"  Players: {len(self.registered_players)}")
            self.log(f"  Teams: {len(self.registered_teams)}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = GolfTournamentAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())