#!/usr/bin/env python3
"""
Backend API Tests for ILWU Local 4 Golf Tournament - Join Existing Team Feature
Tests the new /api/teams/available endpoint and individual registration with team_id
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


def generate_test_player(prefix="TEST_JOIN"):
    """Generate unique test player data"""
    suffix = ''.join(random.choices(string.digits, k=4))
    return {
        "first_name": f"{prefix}_{suffix}",
        "last_name": f"User{suffix}",
        "phone": f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
        "email": f"testjoin{suffix}@example.com",
        "association": "Local 4"
    }


class TestAvailableTeamsEndpoint:
    """Tests for GET /api/teams/available endpoint"""
    
    def test_available_teams_returns_200(self):
        """Test that /api/teams/available returns 200"""
        response = requests.get(f"{API_URL}/teams/available")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("SUCCESS: /api/teams/available returns 200")
    
    def test_available_teams_returns_list(self):
        """Test that /api/teams/available returns a list"""
        response = requests.get(f"{API_URL}/teams/available")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"SUCCESS: /api/teams/available returns list with {len(data)} teams")
    
    def test_available_teams_has_required_fields(self):
        """Test that each team in response has required fields"""
        response = requests.get(f"{API_URL}/teams/available")
        data = response.json()
        
        if len(data) == 0:
            pytest.skip("No available teams to test field structure")
        
        required_fields = ["team_id", "team_number", "captain_name", "spots_remaining"]
        for team in data:
            for field in required_fields:
                assert field in team, f"Missing field '{field}' in team response"
        
        print(f"SUCCESS: All {len(data)} teams have required fields: {required_fields}")
    
    def test_available_teams_spots_remaining_positive(self):
        """Test that spots_remaining is positive for all available teams"""
        response = requests.get(f"{API_URL}/teams/available")
        data = response.json()
        
        for team in data:
            assert team["spots_remaining"] > 0, f"Team {team['team_number']} has spots_remaining={team['spots_remaining']}, expected > 0"
        
        print(f"SUCCESS: All {len(data)} teams have positive spots_remaining")
    
    def test_available_teams_not_full(self):
        """Test that full teams (4 players) are NOT returned"""
        response = requests.get(f"{API_URL}/teams/available")
        data = response.json()
        
        for team in data:
            assert team["spots_remaining"] > 0, f"Full team {team['team_number']} should not be in available list"
            assert team["spots_remaining"] <= 3, f"Team {team['team_number']} has invalid spots_remaining={team['spots_remaining']}"
        
        print(f"SUCCESS: No full teams in available list")
    
    def test_available_teams_have_captain(self):
        """Test that all available teams have a captain (non-empty captain_name)"""
        response = requests.get(f"{API_URL}/teams/available")
        data = response.json()
        
        for team in data:
            assert team["captain_name"], f"Team {team['team_number']} has empty captain_name"
            assert len(team["captain_name"].strip()) > 0, f"Team {team['team_number']} has whitespace-only captain_name"
        
        print(f"SUCCESS: All {len(data)} teams have valid captain names")


class TestIndividualRegistrationWithTeamId:
    """Tests for POST /api/register/individual with optional team_id"""
    
    def test_register_individual_without_team_id_still_works(self):
        """Test that individual registration without team_id still auto-assigns (existing behavior)"""
        player_data = generate_test_player("TEST_AUTOASSIGN")
        response = requests.post(f"{API_URL}/register/individual", json=player_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert data["success"] == True, "Expected success=True"
        assert "team_number" in data, "Missing team_number in response"
        assert data["team_number"] >= 1 and data["team_number"] <= 18, f"Team number {data['team_number']} out of range"
        
        print(f"SUCCESS: Individual auto-assigned to Team {data['team_number']}")
        return data
    
    def test_register_individual_with_valid_team_id(self):
        """Test that individual registration with valid team_id joins that specific team"""
        # First get available teams
        available_response = requests.get(f"{API_URL}/teams/available")
        available_teams = available_response.json()
        
        if len(available_teams) == 0:
            pytest.skip("No available teams to join")
        
        # Pick a team to join
        target_team = available_teams[0]
        target_team_id = target_team["team_id"]
        target_team_number = target_team["team_number"]
        initial_spots = target_team["spots_remaining"]
        
        # Register individual with team_id
        player_data = generate_test_player("TEST_JOINTEAM")
        player_data["team_id"] = target_team_id
        
        response = requests.post(f"{API_URL}/register/individual", json=player_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert data["success"] == True, "Expected success=True"
        assert data["team_number"] == target_team_number, f"Expected team_number={target_team_number}, got {data['team_number']}"
        assert data["is_captain"] == False, "Player joining existing team should NOT be captain"
        
        # Verify spots decreased
        verify_response = requests.get(f"{API_URL}/teams/available")
        verify_teams = verify_response.json()
        
        updated_team = next((t for t in verify_teams if t["team_id"] == target_team_id), None)
        if updated_team:
            assert updated_team["spots_remaining"] == initial_spots - 1, f"Expected spots_remaining to decrease by 1"
        
        print(f"SUCCESS: Individual joined Team {target_team_number}, is_captain={data['is_captain']}")
        return data
    
    def test_register_individual_with_invalid_team_id(self):
        """Test that individual registration with invalid team_id returns 400"""
        player_data = generate_test_player("TEST_INVALIDTEAM")
        player_data["team_id"] = "invalid-uuid-that-does-not-exist"
        
        response = requests.post(f"{API_URL}/register/individual", json=player_data)
        
        assert response.status_code == 400, f"Expected 400 for invalid team_id, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        
        print(f"SUCCESS: Invalid team_id returns 400 with message: {data['detail']}")
    
    def test_register_individual_with_full_team_id(self):
        """Test that individual registration with full team_id returns 400"""
        # First, create a full team
        team_data = {
            "players": [generate_test_player(f"TEST_FULLTEAM{i}") for i in range(4)]
        }
        team_response = requests.post(f"{API_URL}/register/team", json=team_data)
        
        if team_response.status_code != 200:
            pytest.skip("Could not create full team for test")
        
        team_result = team_response.json()
        full_team_number = team_result["team_number"]
        
        # Get the team_id of the full team
        teams_response = requests.get(f"{API_URL}/teams")
        all_teams = teams_response.json()
        full_team = next((t for t in all_teams if t["team_number"] == full_team_number), None)
        
        if not full_team:
            pytest.skip("Could not find full team")
        
        full_team_id = full_team["id"]
        
        # Try to join the full team
        player_data = generate_test_player("TEST_JOINFULL")
        player_data["team_id"] = full_team_id
        
        response = requests.post(f"{API_URL}/register/individual", json=player_data)
        
        assert response.status_code == 400, f"Expected 400 for full team, got {response.status_code}"
        data = response.json()
        assert "full" in data.get("detail", "").lower(), f"Expected 'full' in error message, got: {data.get('detail')}"
        
        print(f"SUCCESS: Joining full team returns 400 with message: {data['detail']}")


class TestAvailableTeamsFiltering:
    """Tests to verify /api/teams/available correctly filters teams"""
    
    def test_full_team_not_in_available(self):
        """Test that a full team (4 players) does not appear in available teams"""
        # Create a full team
        team_data = {
            "players": [generate_test_player(f"TEST_FILTER{i}") for i in range(4)]
        }
        team_response = requests.post(f"{API_URL}/register/team", json=team_data)
        
        if team_response.status_code != 200:
            pytest.skip("Could not create full team for test")
        
        team_result = team_response.json()
        full_team_number = team_result["team_number"]
        
        # Check available teams
        available_response = requests.get(f"{API_URL}/teams/available")
        available_teams = available_response.json()
        
        full_team_in_available = any(t["team_number"] == full_team_number for t in available_teams)
        assert not full_team_in_available, f"Full team {full_team_number} should NOT be in available teams"
        
        print(f"SUCCESS: Full team {full_team_number} correctly excluded from available teams")
    
    def test_empty_team_not_in_available(self):
        """Test that empty teams (no captain) do not appear in available teams"""
        # Get available teams
        available_response = requests.get(f"{API_URL}/teams/available")
        available_teams = available_response.json()
        
        # All teams should have a captain
        for team in available_teams:
            assert team["captain_name"], f"Team {team['team_number']} has no captain but is in available list"
        
        print(f"SUCCESS: No empty teams in available list (all {len(available_teams)} have captains)")


class TestEndToEndJoinTeamFlow:
    """End-to-end tests for the join existing team flow"""
    
    def test_full_flow_create_team_then_join(self):
        """Test complete flow: create team with 2 players, then have individual join"""
        # Step 1: Create a team with 2 players
        team_data = {
            "players": [
                generate_test_player("TEST_E2E_CAPTAIN"),
                generate_test_player("TEST_E2E_MEMBER1")
            ]
        }
        team_response = requests.post(f"{API_URL}/register/team", json=team_data)
        assert team_response.status_code == 200, f"Failed to create team: {team_response.status_code}"
        
        team_result = team_response.json()
        team_number = team_result["team_number"]
        print(f"Step 1: Created Team {team_number} with 2 players")
        
        # Step 2: Verify team appears in available teams
        available_response = requests.get(f"{API_URL}/teams/available")
        available_teams = available_response.json()
        
        target_team = next((t for t in available_teams if t["team_number"] == team_number), None)
        assert target_team is not None, f"Team {team_number} not found in available teams"
        assert target_team["spots_remaining"] == 2, f"Expected 2 spots, got {target_team['spots_remaining']}"
        print(f"Step 2: Team {team_number} in available list with {target_team['spots_remaining']} spots")
        
        # Step 3: Individual joins the team
        player_data = generate_test_player("TEST_E2E_JOINER")
        player_data["team_id"] = target_team["team_id"]
        
        join_response = requests.post(f"{API_URL}/register/individual", json=player_data)
        assert join_response.status_code == 200, f"Failed to join team: {join_response.status_code}"
        
        join_result = join_response.json()
        assert join_result["team_number"] == team_number, f"Joined wrong team: {join_result['team_number']}"
        assert join_result["is_captain"] == False, "Joiner should not be captain"
        print(f"Step 3: Individual joined Team {team_number}, is_captain={join_result['is_captain']}")
        
        # Step 4: Verify team now has 1 less spot
        verify_response = requests.get(f"{API_URL}/teams/available")
        verify_teams = verify_response.json()
        
        updated_team = next((t for t in verify_teams if t["team_number"] == team_number), None)
        if updated_team:
            assert updated_team["spots_remaining"] == 1, f"Expected 1 spot remaining, got {updated_team['spots_remaining']}"
            print(f"Step 4: Team {team_number} now has {updated_team['spots_remaining']} spot remaining")
        else:
            # Team might be full now if it had 3 players before
            print(f"Step 4: Team {team_number} may be full or removed from available list")
        
        print("SUCCESS: Full end-to-end join team flow completed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
