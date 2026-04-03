#!/usr/bin/env python3
"""
Backend API Tests for ILWU Local 4 Golf Tournament - New Features
Tests event date, early bird pricing, and tournament info endpoint
"""

import pytest
import requests
import os
import random
import string

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://golf-tournament-reg.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

# Admin credentials
ADMIN_AUTH = ("admin", "ilwu4golf2024")


class TestTournamentInfo:
    """Tests for /api/tournament-info endpoint - new pricing and date fields"""
    
    def test_tournament_info_returns_200(self):
        """Test that tournament-info endpoint returns 200"""
        response = requests.get(f"{API_URL}/tournament-info")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: tournament-info returns 200")
    
    def test_tournament_info_has_event_date(self):
        """Test that tournament-info returns correct event date"""
        response = requests.get(f"{API_URL}/tournament-info")
        data = response.json()
        
        assert "date" in data, "Missing 'date' field in response"
        assert data["date"] == "September 3, 2026", f"Expected 'September 3, 2026', got '{data['date']}'"
        print(f"SUCCESS: Event date is '{data['date']}'")
    
    def test_tournament_info_has_early_bird_fields(self):
        """Test that tournament-info returns early bird pricing fields"""
        response = requests.get(f"{API_URL}/tournament-info")
        data = response.json()
        
        # Check required early bird fields
        required_fields = ["is_early_bird", "early_bird_price", "regular_price", "early_bird_deadline"]
        for field in required_fields:
            assert field in data, f"Missing '{field}' field in response"
        
        # Verify values
        assert data["early_bird_price"] == 125, f"Expected early_bird_price=125, got {data['early_bird_price']}"
        assert data["regular_price"] == 150, f"Expected regular_price=150, got {data['regular_price']}"
        assert data["early_bird_deadline"] == "June 20, 2026", f"Expected deadline 'June 20, 2026', got '{data['early_bird_deadline']}'"
        
        print(f"SUCCESS: Early bird fields present - is_early_bird={data['is_early_bird']}, early_bird_price=${data['early_bird_price']}, regular_price=${data['regular_price']}")
    
    def test_tournament_info_dynamic_pricing(self):
        """Test that price_per_player reflects early bird status"""
        response = requests.get(f"{API_URL}/tournament-info")
        data = response.json()
        
        # Since we're before June 20, 2026, early bird should be active
        assert data["is_early_bird"] == True, "Expected is_early_bird=True (current date is before June 20, 2026)"
        assert data["price_per_player"] == 125, f"Expected price_per_player=125 (early bird), got {data['price_per_player']}"
        assert data["price_per_team"] == 500, f"Expected price_per_team=500 (4x125), got {data['price_per_team']}"
        
        print(f"SUCCESS: Dynamic pricing correct - ${data['price_per_player']}/player, ${data['price_per_team']}/team")
    
    def test_tournament_info_has_all_required_fields(self):
        """Test that tournament-info returns all required fields"""
        response = requests.get(f"{API_URL}/tournament-info")
        data = response.json()
        
        required_fields = [
            "location", "date", "price_per_player", "price_per_team",
            "early_bird_price", "regular_price", "is_early_bird", "early_bird_deadline",
            "max_teams", "max_players_per_team", "current_teams", "current_players",
            "full_teams", "registration_open", "payment_info"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        print(f"SUCCESS: All {len(required_fields)} required fields present")


class TestIndividualRegistration:
    """Tests for individual registration with dynamic pricing"""
    
    def generate_test_player(self):
        """Generate unique test player data"""
        suffix = ''.join(random.choices(string.digits, k=4))
        return {
            "first_name": f"TEST_Player{suffix}",
            "last_name": f"User{suffix}",
            "phone": f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "email": f"test{suffix}@example.com",
            "association": "Local 4"
        }
    
    def test_individual_registration_success(self):
        """Test individual registration returns success"""
        player_data = self.generate_test_player()
        response = requests.post(f"{API_URL}/register/individual", json=player_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert data["success"] == True, "Expected success=True"
        assert "team_number" in data, "Missing team_number in response"
        assert data["team_number"] >= 1 and data["team_number"] <= 18, f"Team number {data['team_number']} out of range 1-18"
        
        print(f"SUCCESS: Individual registered to Team {data['team_number']}, captain={data.get('is_captain', False)}")
        return data
    
    def test_individual_registration_validation(self):
        """Test individual registration validates required fields"""
        invalid_data = {"first_name": "Test"}  # Missing required fields
        response = requests.post(f"{API_URL}/register/individual", json=invalid_data)
        
        assert response.status_code == 422, f"Expected 422 validation error, got {response.status_code}"
        print("SUCCESS: Invalid registration returns 422 validation error")


class TestTeamRegistration:
    """Tests for team registration with dynamic pricing"""
    
    def generate_test_player(self, prefix="TEST"):
        """Generate unique test player data"""
        suffix = ''.join(random.choices(string.digits, k=4))
        return {
            "first_name": f"{prefix}_Player{suffix}",
            "last_name": f"User{suffix}",
            "phone": f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            "email": f"test{suffix}@example.com",
            "association": "Local 4"
        }
    
    def test_team_registration_success(self):
        """Test team registration with 2 players"""
        team_data = {
            "players": [
                self.generate_test_player("TEST_Captain"),
                self.generate_test_player("TEST_Member")
            ]
        }
        response = requests.post(f"{API_URL}/register/team", json=team_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert data["success"] == True, "Expected success=True"
        assert "team_number" in data, "Missing team_number in response"
        assert len(data["player_ids"]) == 2, f"Expected 2 player_ids, got {len(data['player_ids'])}"
        
        print(f"SUCCESS: Team of 2 registered as Team {data['team_number']}")
        return data
    
    def test_team_registration_full_team(self):
        """Test team registration with 4 players (full team)"""
        team_data = {
            "players": [self.generate_test_player(f"TEST_Full{i}") for i in range(4)]
        }
        response = requests.post(f"{API_URL}/register/team", json=team_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert len(data["player_ids"]) == 4, f"Expected 4 player_ids, got {len(data['player_ids'])}"
        print(f"SUCCESS: Full team of 4 registered as Team {data['team_number']}")
    
    def test_team_registration_too_many_players(self):
        """Test team registration rejects more than 4 players"""
        team_data = {
            "players": [self.generate_test_player(f"TEST_Invalid{i}") for i in range(5)]
        }
        response = requests.post(f"{API_URL}/register/team", json=team_data)
        
        assert response.status_code == 400, f"Expected 400 for 5 players, got {response.status_code}"
        print("SUCCESS: Team with 5 players rejected with 400")


class TestAdminEndpoints:
    """Tests for admin endpoints"""
    
    def test_admin_verify_valid_credentials(self):
        """Test admin verification with valid credentials"""
        response = requests.get(f"{API_URL}/admin/verify", auth=ADMIN_AUTH)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["success"] == True, "Expected success=True"
        print(f"SUCCESS: Admin verified as '{data.get('username', 'admin')}'")
    
    def test_admin_verify_invalid_credentials(self):
        """Test admin verification with invalid credentials"""
        response = requests.get(f"{API_URL}/admin/verify", auth=("wrong", "credentials"))
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Invalid credentials rejected with 401")
    
    def test_admin_dashboard(self):
        """Test admin dashboard returns stats"""
        response = requests.get(f"{API_URL}/admin/dashboard", auth=ADMIN_AUTH)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        required_fields = ["total_players", "total_teams", "teams_full", "spots_remaining"]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        print(f"SUCCESS: Dashboard stats - {data['total_players']} players, {data['total_teams']} teams")


class TestPublicEndpoints:
    """Tests for public endpoints"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{API_URL}/")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "message" in data, "Missing message in response"
        print(f"SUCCESS: API root returns message: '{data['message']}'")
    
    def test_get_teams(self):
        """Test public teams endpoint"""
        response = requests.get(f"{API_URL}/teams")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list of teams"
        print(f"SUCCESS: Teams endpoint returns {len(data)} teams")
    
    def test_email_status(self):
        """Test email status endpoint"""
        response = requests.get(f"{API_URL}/email-status")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "email_enabled" in data, "Missing email_enabled field"
        print(f"SUCCESS: Email status - enabled={data['email_enabled']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
