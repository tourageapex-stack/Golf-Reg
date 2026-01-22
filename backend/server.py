from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import secrets
import random
import csv
import io
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security for admin
security = HTTPBasic()

# Admin credentials (in production, use environment variables)
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'ilwu4golf2024')

# Constants
MAX_TEAMS = 18
MAX_PLAYERS_PER_TEAM = 4
PRICE_PER_PLAYER = 150
PRICE_PER_TEAM = 600

# Models
class PlayerBase(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    association: str  # local number or "friend of local member"

class PlayerCreate(PlayerBase):
    pass

class Player(PlayerBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_id: Optional[str] = None
    is_captain: bool = False
    registration_order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TeamBase(BaseModel):
    team_number: int  # 1-18

class Team(TeamBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    players: List[str] = []  # List of player IDs
    is_full: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TeamRegistration(BaseModel):
    players: List[PlayerCreate]  # 1-4 players

class IndividualRegistration(PlayerCreate):
    pass

class RegistrationResponse(BaseModel):
    success: bool
    message: str
    team_number: Optional[int] = None
    player_ids: List[str] = []
    is_captain: bool = False

class TeamWithPlayers(BaseModel):
    id: str
    team_number: int
    players: List[Player]
    is_full: bool
    spots_remaining: int
    created_at: str

class DashboardStats(BaseModel):
    total_players: int
    total_teams: int
    teams_full: int
    spots_remaining: int
    unassigned_players: int

# Helper functions
async def get_next_registration_order():
    """Get the next registration order number"""
    result = await db.players.find_one(sort=[("registration_order", -1)])
    if result:
        return result.get("registration_order", 0) + 1
    return 1

async def get_available_team_numbers():
    """Get list of team numbers not yet assigned"""
    used_numbers = await db.teams.distinct("team_number")
    all_numbers = list(range(1, MAX_TEAMS + 1))
    return [n for n in all_numbers if n not in used_numbers]

async def assign_team_number():
    """Randomly assign a team number from available numbers"""
    available = await get_available_team_numbers()
    if not available:
        return None
    return random.choice(available)

async def find_or_create_team_for_individual():
    """Find a team with open spots or create a new one for individual registration"""
    # Find a team that's not full and has players (to join existing)
    team = await db.teams.find_one({"is_full": False, "players": {"$ne": []}}, sort=[("created_at", 1)])
    
    if team:
        return team
    
    # Check if we can create a new team
    team_count = await db.teams.count_documents({})
    if team_count >= MAX_TEAMS:
        # Check if any existing team has space
        team = await db.teams.find_one({"is_full": False}, sort=[("created_at", 1)])
        if team:
            return team
        return None
    
    # Create new team
    team_number = await assign_team_number()
    if team_number is None:
        return None
    
    new_team = Team(team_number=team_number)
    team_dict = new_team.model_dump()
    await db.teams.insert_one(team_dict)
    return team_dict

async def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    """Verify admin credentials"""
    correct_username = secrets.compare_digest(credentials.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# Routes
@api_router.get("/")
async def root():
    return {"message": "ILWU Local 4 Golf Tournament API"}

@api_router.get("/tournament-info")
async def get_tournament_info():
    """Get tournament information and availability"""
    total_teams = await db.teams.count_documents({})
    total_players = await db.players.count_documents({})
    full_teams = await db.teams.count_documents({"is_full": True})
    
    # Calculate spots
    available_team_spots = MAX_TEAMS - total_teams
    
    return {
        "location": "Club Green Meadows",
        "date": "TBD",
        "price_per_player": PRICE_PER_PLAYER,
        "price_per_team": PRICE_PER_TEAM,
        "max_teams": MAX_TEAMS,
        "max_players_per_team": MAX_PLAYERS_PER_TEAM,
        "current_teams": total_teams,
        "current_players": total_players,
        "full_teams": full_teams,
        "registration_open": total_teams < MAX_TEAMS or full_teams < total_teams,
        "payment_info": "Payment can be made at Local 4 Credit Union or at the Hall"
    }

@api_router.post("/register/individual", response_model=RegistrationResponse)
async def register_individual(player_data: IndividualRegistration):
    """Register an individual player - will be assigned to a team"""
    # Check if registration is still open
    team_count = await db.teams.count_documents({})
    full_teams = await db.teams.count_documents({"is_full": True})
    
    if team_count >= MAX_TEAMS and full_teams >= MAX_TEAMS:
        raise HTTPException(status_code=400, detail="Registration is full. No spots available.")
    
    # Find or create team for this player
    team = await find_or_create_team_for_individual()
    if not team:
        raise HTTPException(status_code=400, detail="No teams available. Registration is full.")
    
    # Check if player will be captain (first in team)
    is_captain = len(team.get("players", [])) == 0
    
    # Get registration order
    reg_order = await get_next_registration_order()
    
    # Create player
    player = Player(
        **player_data.model_dump(),
        team_id=team["id"],
        is_captain=is_captain,
        registration_order=reg_order
    )
    player_dict = player.model_dump()
    await db.players.insert_one(player_dict)
    
    # Update team
    new_players = team.get("players", []) + [player.id]
    is_full = len(new_players) >= MAX_PLAYERS_PER_TEAM
    await db.teams.update_one(
        {"id": team["id"]},
        {"$set": {"players": new_players, "is_full": is_full}}
    )
    
    return RegistrationResponse(
        success=True,
        message=f"Successfully registered! You have been assigned to Team {team['team_number']}." + 
                (" You are the team captain!" if is_captain else ""),
        team_number=team["team_number"],
        player_ids=[player.id],
        is_captain=is_captain
    )

@api_router.post("/register/team", response_model=RegistrationResponse)
async def register_team(team_data: TeamRegistration):
    """Register a team of 1-4 players"""
    if len(team_data.players) < 1 or len(team_data.players) > MAX_PLAYERS_PER_TEAM:
        raise HTTPException(
            status_code=400, 
            detail=f"Team must have between 1 and {MAX_PLAYERS_PER_TEAM} players"
        )
    
    # Check if we can create a new team
    team_count = await db.teams.count_documents({})
    if team_count >= MAX_TEAMS:
        raise HTTPException(status_code=400, detail="Maximum number of teams reached. Registration is full.")
    
    # Assign team number
    team_number = await assign_team_number()
    if team_number is None:
        raise HTTPException(status_code=400, detail="No team numbers available.")
    
    # Create team
    new_team = Team(team_number=team_number)
    team_dict = new_team.model_dump()
    await db.teams.insert_one(team_dict)
    
    # Create players
    player_ids = []
    for i, player_data in enumerate(team_data.players):
        reg_order = await get_next_registration_order()
        player = Player(
            **player_data.model_dump(),
            team_id=new_team.id,
            is_captain=(i == 0),  # First player is captain
            registration_order=reg_order
        )
        player_dict = player.model_dump()
        await db.players.insert_one(player_dict)
        player_ids.append(player.id)
    
    # Update team with players
    is_full = len(player_ids) >= MAX_PLAYERS_PER_TEAM
    await db.teams.update_one(
        {"id": new_team.id},
        {"$set": {"players": player_ids, "is_full": is_full}}
    )
    
    return RegistrationResponse(
        success=True,
        message=f"Team successfully registered! Your team number is {team_number}.",
        team_number=team_number,
        player_ids=player_ids,
        is_captain=True
    )

@api_router.get("/teams", response_model=List[TeamWithPlayers])
async def get_all_teams():
    """Get all teams with their players (public view)"""
    teams = await db.teams.find({}, {"_id": 0}).sort("team_number", 1).to_list(100)
    result = []
    
    for team in teams:
        player_ids = team.get("players", [])
        players = await db.players.find({"id": {"$in": player_ids}}, {"_id": 0}).to_list(10)
        
        # Sort players: captain first, then by registration order
        players_sorted = sorted(players, key=lambda p: (not p.get("is_captain", False), p.get("registration_order", 0)))
        
        result.append(TeamWithPlayers(
            id=team["id"],
            team_number=team["team_number"],
            players=[Player(**p) for p in players_sorted],
            is_full=team.get("is_full", False),
            spots_remaining=MAX_PLAYERS_PER_TEAM - len(player_ids),
            created_at=team.get("created_at", "")
        ))
    
    return result

# Admin routes
@api_router.get("/admin/verify")
async def verify_admin_access(username: str = Depends(verify_admin)):
    """Verify admin credentials"""
    return {"success": True, "username": username}

@api_router.get("/admin/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(username: str = Depends(verify_admin)):
    """Get dashboard statistics for admin"""
    total_players = await db.players.count_documents({})
    total_teams = await db.teams.count_documents({})
    teams_full = await db.teams.count_documents({"is_full": True})
    
    # Calculate total spots
    total_possible_spots = MAX_TEAMS * MAX_PLAYERS_PER_TEAM
    spots_remaining = total_possible_spots - total_players
    
    # Unassigned players (shouldn't happen in normal flow, but just in case)
    unassigned = await db.players.count_documents({"team_id": None})
    
    return DashboardStats(
        total_players=total_players,
        total_teams=total_teams,
        teams_full=teams_full,
        spots_remaining=spots_remaining,
        unassigned_players=unassigned
    )

@api_router.get("/admin/teams", response_model=List[TeamWithPlayers])
async def get_admin_teams(username: str = Depends(verify_admin)):
    """Get all teams with full player details for admin"""
    return await get_all_teams()

@api_router.get("/admin/players")
async def get_all_players(username: str = Depends(verify_admin)):
    """Get all registered players"""
    players = await db.players.find({}, {"_id": 0}).sort("registration_order", 1).to_list(500)
    
    # Add team number to each player
    for player in players:
        if player.get("team_id"):
            team = await db.teams.find_one({"id": player["team_id"]}, {"_id": 0})
            player["team_number"] = team["team_number"] if team else None
    
    return players

@api_router.delete("/admin/player/{player_id}")
async def delete_player(player_id: str, username: str = Depends(verify_admin)):
    """Delete a player and update their team"""
    player = await db.players.find_one({"id": player_id}, {"_id": 0})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    team_id = player.get("team_id")
    was_captain = player.get("is_captain", False)
    
    # Delete player
    await db.players.delete_one({"id": player_id})
    
    if team_id:
        # Update team
        team = await db.teams.find_one({"id": team_id}, {"_id": 0})
        if team:
            new_players = [p for p in team.get("players", []) if p != player_id]
            
            if len(new_players) == 0:
                # Delete empty team
                await db.teams.delete_one({"id": team_id})
            else:
                # Update team
                await db.teams.update_one(
                    {"id": team_id},
                    {"$set": {"players": new_players, "is_full": False}}
                )
                
                # If captain was deleted, assign new captain
                if was_captain and new_players:
                    # Find the player with lowest registration order
                    remaining_players = await db.players.find(
                        {"id": {"$in": new_players}}, {"_id": 0}
                    ).sort("registration_order", 1).to_list(10)
                    
                    if remaining_players:
                        await db.players.update_one(
                            {"id": remaining_players[0]["id"]},
                            {"$set": {"is_captain": True}}
                        )
    
    return {"success": True, "message": "Player deleted successfully"}

@api_router.delete("/admin/team/{team_id}")
async def delete_team(team_id: str, username: str = Depends(verify_admin)):
    """Delete a team and all its players"""
    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Delete all players in the team
    await db.players.delete_many({"team_id": team_id})
    
    # Delete the team
    await db.teams.delete_one({"id": team_id})
    
    return {"success": True, "message": f"Team {team['team_number']} and all its players deleted"}

@api_router.get("/admin/export/csv")
async def export_registrations_csv(username: str = Depends(verify_admin)):
    """Export all registrations to CSV"""
    players = await db.players.find({}, {"_id": 0}).sort("registration_order", 1).to_list(500)
    
    # Add team number to each player
    for player in players:
        if player.get("team_id"):
            team = await db.teams.find_one({"id": player["team_id"]}, {"_id": 0})
            player["team_number"] = team["team_number"] if team else "N/A"
        else:
            player["team_number"] = "N/A"
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header row
    writer.writerow([
        "Registration #",
        "Team #",
        "Captain",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Association",
        "Registered At"
    ])
    
    # Data rows
    for player in players:
        writer.writerow([
            player.get("registration_order", ""),
            player.get("team_number", "N/A"),
            "Yes" if player.get("is_captain", False) else "No",
            player.get("first_name", ""),
            player.get("last_name", ""),
            player.get("email", ""),
            player.get("phone", ""),
            player.get("association", ""),
            player.get("created_at", "")[:10] if player.get("created_at") else ""
        ])
    
    output.seek(0)
    
    # Return as downloadable CSV
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=ilwu_golf_registrations_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    )

@api_router.get("/admin/export/teams-csv")
async def export_teams_csv(username: str = Depends(verify_admin)):
    """Export teams summary to CSV"""
    teams = await db.teams.find({}, {"_id": 0}).sort("team_number", 1).to_list(100)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header row
    writer.writerow([
        "Team #",
        "Status",
        "Players",
        "Captain",
        "Captain Email",
        "Captain Phone",
        "Player 2",
        "Player 3", 
        "Player 4"
    ])
    
    for team in teams:
        player_ids = team.get("players", [])
        players = await db.players.find({"id": {"$in": player_ids}}, {"_id": 0}).to_list(10)
        players_sorted = sorted(players, key=lambda p: (not p.get("is_captain", False), p.get("registration_order", 0)))
        
        captain = players_sorted[0] if players_sorted else None
        
        row = [
            team["team_number"],
            "Full" if team.get("is_full", False) else f"{4 - len(players_sorted)} spots open",
            len(players_sorted),
            f"{captain['first_name']} {captain['last_name']}" if captain else "",
            captain.get("email", "") if captain else "",
            captain.get("phone", "") if captain else ""
        ]
        
        # Add other players
        for i in range(1, 4):
            if i < len(players_sorted):
                p = players_sorted[i]
                row.append(f"{p['first_name']} {p['last_name']}")
            else:
                row.append("")
        
        writer.writerow(row)
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=ilwu_golf_teams_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
