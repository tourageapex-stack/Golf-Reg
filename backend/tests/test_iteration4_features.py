"""
Iteration 4 Feature Tests:
- Check-in system (check-in, undo-check-in)
- Leaderboard (public endpoint, score sorting)
- Team score management
- Dashboard checked_in_players count
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "ilwu4golf2024"

@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def auth_header():
    """Get admin auth header"""
    token = base64.b64encode(f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}".encode()).decode()
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="module")
def test_team_and_player(api_client, auth_header):
    """Create a test team with a player for testing check-in and score features"""
    # Register a test team
    player_data = {
        "players": [{
            "first_name": "TEST_ITER4",
            "last_name": "CheckInPlayer",
            "phone": "555-0001",
            "email": "test_iter4_checkin@test.com",
            "association": "Local 4"
        }]
    }
    response = api_client.post(f"{BASE_URL}/api/register/team", json=player_data)
    assert response.status_code == 200, f"Failed to create test team: {response.text}"
    data = response.json()
    team_number = data["team_number"]
    player_id = data["player_ids"][0]
    
    # Get team_id from teams list
    teams_response = api_client.get(f"{BASE_URL}/api/admin/teams", headers=auth_header)
    teams = teams_response.json()
    team = next((t for t in teams if t["team_number"] == team_number), None)
    team_id = team["id"] if team else None
    
    yield {"team_id": team_id, "team_number": team_number, "player_id": player_id}
    
    # Cleanup: delete the test team
    if team_id:
        api_client.delete(f"{BASE_URL}/api/admin/team/{team_id}", headers=auth_header)


class TestCheckInEndpoints:
    """Test check-in and undo-check-in endpoints"""
    
    def test_check_in_player_success(self, api_client, auth_header, test_team_and_player):
        """PUT /api/admin/player/{player_id}/check-in marks player as checked in"""
        player_id = test_team_and_player["player_id"]
        
        response = api_client.put(
            f"{BASE_URL}/api/admin/player/{player_id}/check-in",
            headers=auth_header
        )
        
        assert response.status_code == 200, f"Check-in failed: {response.text}"
        data = response.json()
        assert data["success"] is True
        assert "checked in" in data["message"].lower()
        
        # Verify player is now checked in via teams endpoint
        teams_response = api_client.get(f"{BASE_URL}/api/admin/teams", headers=auth_header)
        teams = teams_response.json()
        team = next((t for t in teams if t["team_number"] == test_team_and_player["team_number"]), None)
        player = next((p for p in team["players"] if p["id"] == player_id), None)
        assert player["checked_in"] is True, "Player should be checked in"
        assert player["checkin_time"] is not None, "Check-in time should be set"
    
    def test_undo_check_in_player_success(self, api_client, auth_header, test_team_and_player):
        """PUT /api/admin/player/{player_id}/undo-check-in undoes check-in"""
        player_id = test_team_and_player["player_id"]
        
        # First ensure player is checked in
        api_client.put(
            f"{BASE_URL}/api/admin/player/{player_id}/check-in",
            headers=auth_header
        )
        
        # Now undo check-in
        response = api_client.put(
            f"{BASE_URL}/api/admin/player/{player_id}/undo-check-in",
            headers=auth_header
        )
        
        assert response.status_code == 200, f"Undo check-in failed: {response.text}"
        data = response.json()
        assert data["success"] is True
        assert "undone" in data["message"].lower()
        
        # Verify player is no longer checked in
        teams_response = api_client.get(f"{BASE_URL}/api/admin/teams", headers=auth_header)
        teams = teams_response.json()
        team = next((t for t in teams if t["team_number"] == test_team_and_player["team_number"]), None)
        player = next((p for p in team["players"] if p["id"] == player_id), None)
        assert player["checked_in"] is False, "Player should not be checked in"
        assert player["checkin_time"] is None, "Check-in time should be None"
    
    def test_check_in_nonexistent_player(self, api_client, auth_header):
        """PUT /api/admin/player/{invalid_id}/check-in returns 404"""
        response = api_client.put(
            f"{BASE_URL}/api/admin/player/nonexistent-id-12345/check-in",
            headers=auth_header
        )
        assert response.status_code == 404
    
    def test_check_in_requires_auth(self, api_client, test_team_and_player):
        """Check-in endpoint requires admin authentication"""
        player_id = test_team_and_player["player_id"]
        response = api_client.put(f"{BASE_URL}/api/admin/player/{player_id}/check-in")
        assert response.status_code == 401


class TestDashboardCheckedInCount:
    """Test that dashboard returns checked_in_players count"""
    
    def test_dashboard_returns_checked_in_count(self, api_client, auth_header, test_team_and_player):
        """GET /api/admin/dashboard returns checked_in_players count"""
        player_id = test_team_and_player["player_id"]
        
        # Get initial count
        response = api_client.get(f"{BASE_URL}/api/admin/dashboard", headers=auth_header)
        assert response.status_code == 200
        data = response.json()
        assert "checked_in_players" in data, "Dashboard should include checked_in_players"
        initial_count = data["checked_in_players"]
        
        # Check in the player
        api_client.put(
            f"{BASE_URL}/api/admin/player/{player_id}/check-in",
            headers=auth_header
        )
        
        # Verify count increased
        response = api_client.get(f"{BASE_URL}/api/admin/dashboard", headers=auth_header)
        data = response.json()
        assert data["checked_in_players"] >= initial_count, "Checked in count should increase"
        
        # Undo check-in for cleanup
        api_client.put(
            f"{BASE_URL}/api/admin/player/{player_id}/undo-check-in",
            headers=auth_header
        )


class TestTeamScoreEndpoint:
    """Test team score management"""
    
    def test_set_team_score_success(self, api_client, auth_header, test_team_and_player):
        """PUT /api/admin/team/{team_id}/score sets team score correctly"""
        team_id = test_team_and_player["team_id"]
        
        response = api_client.put(
            f"{BASE_URL}/api/admin/team/{team_id}/score",
            json={"score": 72},
            headers=auth_header
        )
        
        assert response.status_code == 200, f"Set score failed: {response.text}"
        data = response.json()
        assert data["success"] is True
        assert "72" in data["message"]
        
        # Verify score is set via teams endpoint
        teams_response = api_client.get(f"{BASE_URL}/api/admin/teams", headers=auth_header)
        teams = teams_response.json()
        team = next((t for t in teams if t["id"] == team_id), None)
        assert team["score"] == 72, "Team score should be 72"
    
    def test_set_team_score_nonexistent_team(self, api_client, auth_header):
        """PUT /api/admin/team/{invalid_id}/score returns 404"""
        response = api_client.put(
            f"{BASE_URL}/api/admin/team/nonexistent-team-id/score",
            json={"score": 72},
            headers=auth_header
        )
        assert response.status_code == 404
    
    def test_set_team_score_requires_auth(self, api_client, test_team_and_player):
        """Score endpoint requires admin authentication"""
        team_id = test_team_and_player["team_id"]
        response = api_client.put(
            f"{BASE_URL}/api/admin/team/{team_id}/score",
            json={"score": 72}
        )
        assert response.status_code == 401


class TestLeaderboardEndpoint:
    """Test public leaderboard endpoint"""
    
    def test_leaderboard_is_public(self, api_client):
        """GET /api/leaderboard is publicly accessible (no auth required)"""
        response = api_client.get(f"{BASE_URL}/api/leaderboard")
        assert response.status_code == 200, f"Leaderboard should be public: {response.text}"
    
    def test_leaderboard_returns_team_data(self, api_client):
        """GET /api/leaderboard returns teams with expected fields"""
        response = api_client.get(f"{BASE_URL}/api/leaderboard")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list), "Leaderboard should return a list"
        
        if len(data) > 0:
            team = data[0]
            assert "team_number" in team, "Team should have team_number"
            assert "score" in team, "Team should have score field"
            assert "captain_name" in team, "Team should have captain_name"
            assert "player_count" in team, "Team should have player_count"
            assert "player_names" in team, "Team should have player_names"
    
    def test_leaderboard_sorted_by_score_ascending(self, api_client, auth_header):
        """GET /api/leaderboard returns teams sorted by score (ascending for golf)"""
        # Create two test teams with different scores
        team1_data = {
            "players": [{
                "first_name": "TEST_LB1",
                "last_name": "Player",
                "phone": "555-1001",
                "email": "test_lb1@test.com",
                "association": "Local 4"
            }]
        }
        team2_data = {
            "players": [{
                "first_name": "TEST_LB2",
                "last_name": "Player",
                "phone": "555-1002",
                "email": "test_lb2@test.com",
                "association": "Local 4"
            }]
        }
        
        # Register teams
        resp1 = api_client.post(f"{BASE_URL}/api/register/team", json=team1_data)
        resp2 = api_client.post(f"{BASE_URL}/api/register/team", json=team2_data)
        
        team1_number = resp1.json()["team_number"]
        team2_number = resp2.json()["team_number"]
        
        # Get team IDs
        teams_response = api_client.get(f"{BASE_URL}/api/admin/teams", headers=auth_header)
        teams = teams_response.json()
        team1 = next((t for t in teams if t["team_number"] == team1_number), None)
        team2 = next((t for t in teams if t["team_number"] == team2_number), None)
        
        # Set scores (lower is better in golf)
        api_client.put(
            f"{BASE_URL}/api/admin/team/{team1['id']}/score",
            json={"score": 80},  # Higher score (worse)
            headers=auth_header
        )
        api_client.put(
            f"{BASE_URL}/api/admin/team/{team2['id']}/score",
            json={"score": 68},  # Lower score (better)
            headers=auth_header
        )
        
        # Get leaderboard
        response = api_client.get(f"{BASE_URL}/api/leaderboard")
        data = response.json()
        
        # Find our test teams in the leaderboard
        scored_teams = [t for t in data if t["score"] is not None]
        
        # Verify ascending order (lower scores first)
        for i in range(len(scored_teams) - 1):
            assert scored_teams[i]["score"] <= scored_teams[i + 1]["score"], \
                f"Leaderboard should be sorted ascending: {scored_teams[i]['score']} should be <= {scored_teams[i + 1]['score']}"
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/admin/team/{team1['id']}", headers=auth_header)
        api_client.delete(f"{BASE_URL}/api/admin/team/{team2['id']}", headers=auth_header)
    
    def test_leaderboard_scored_teams_first(self, api_client, auth_header):
        """GET /api/leaderboard returns scored teams first, then unscored"""
        # Create a team without score
        team_data = {
            "players": [{
                "first_name": "TEST_UNSCORED",
                "last_name": "Player",
                "phone": "555-2001",
                "email": "test_unscored@test.com",
                "association": "Local 4"
            }]
        }
        
        resp = api_client.post(f"{BASE_URL}/api/register/team", json=team_data)
        team_number = resp.json()["team_number"]
        
        # Get team ID
        teams_response = api_client.get(f"{BASE_URL}/api/admin/teams", headers=auth_header)
        teams = teams_response.json()
        team = next((t for t in teams if t["team_number"] == team_number), None)
        
        # Get leaderboard (team has no score)
        response = api_client.get(f"{BASE_URL}/api/leaderboard")
        data = response.json()
        
        # Find where scored teams end and unscored begin
        scored_indices = [i for i, t in enumerate(data) if t["score"] is not None]
        unscored_indices = [i for i, t in enumerate(data) if t["score"] is None]
        
        if scored_indices and unscored_indices:
            max_scored_idx = max(scored_indices)
            min_unscored_idx = min(unscored_indices)
            assert max_scored_idx < min_unscored_idx, \
                "All scored teams should appear before unscored teams"
        
        # Cleanup
        api_client.delete(f"{BASE_URL}/api/admin/team/{team['id']}", headers=auth_header)


class TestAdminLogin:
    """Test admin login endpoint"""
    
    def test_admin_login_success(self, api_client):
        """POST /api/admin/login with valid credentials returns token"""
        response = api_client.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert data["username"] == ADMIN_USERNAME
    
    def test_admin_login_invalid_credentials(self, api_client):
        """POST /api/admin/login with invalid credentials returns 401"""
        response = api_client.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": "wrong", "password": "wrong"}
        )
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
