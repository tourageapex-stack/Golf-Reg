from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, Header
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os
import logging
import secrets
import random
import csv
import io
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', '')
db_name = os.environ.get('DB_NAME', 'ilwu_golf')
client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
db = client[db_name]

# Create the main app
app = FastAPI()

# Admin credentials
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'ilwu4golf2024')

# Gmail SMTP settings
GMAIL_USER = os.environ.get('GMAIL_USER', '')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '')
EMAIL_ENABLED = bool(GMAIL_USER and GMAIL_APP_PASSWORD)

# Constants
MAX_TEAMS = 18
MAX_PLAYERS_PER_TEAM = 4
EARLY_BIRD_PRICE = 125
REGULAR_PRICE = 150
EARLY_BIRD_DEADLINE = datetime(2026, 6, 20, tzinfo=timezone.utc)
EVENT_DATE = "September 3, 2026"

def get_current_price():
    now = datetime.now(timezone.utc)
    if now < EARLY_BIRD_DEADLINE:
        return EARLY_BIRD_PRICE
    return REGULAR_PRICE

def get_team_price(player_count):
    price_per = get_current_price()
    return price_per * player_count

# Models
class PlayerBase(BaseModel):
    first_name: str
    last_name: str
    phone: str
    email: EmailStr
    association: str

class PlayerCreate(PlayerBase):
    pass

class Player(PlayerBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_id: Optional[str] = None
    is_captain: bool = False
    registration_order: int = 0
    payment_status: str = "unpaid"
    payment_date: Optional[str] = None
    checked_in: bool = False
    checkin_time: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TeamBase(BaseModel):
    team_number: int

class Team(TeamBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    players: List[str] = []
    is_full: bool = False
    score: Optional[int] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TeamRegistration(BaseModel):
    players: List[PlayerCreate]

class IndividualRegistration(PlayerCreate):
    team_id: Optional[str] = None

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
    score: Optional[int] = None
    created_at: str

class DashboardStats(BaseModel):
    total_players: int
    total_teams: int
    teams_full: int
    spots_remaining: int
    unassigned_players: int
    paid_players: int
    unpaid_players: int
    checked_in_players: int

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Email Functions
def send_confirmation_email(to_email: str, player_name: str, team_number: int, is_captain: bool, is_team_reg: bool = False, player_count: int = 1):
    if not EMAIL_ENABLED:
        logger.warning("Email not configured - skipping confirmation email")
        return False
    try:
        price_per = get_current_price()
        is_early_bird = datetime.now(timezone.utc) < EARLY_BIRD_DEADLINE
        total_cost = get_team_price(player_count) if is_team_reg else price_per
        pricing_label = "Early Bird" if is_early_bird else "Regular"
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"ILWU Local 4 Golf Tournament - Registration Confirmed (Team {team_number})"
        msg['From'] = GMAIL_USER
        msg['To'] = to_email
        reg_type = f"Team of {player_count}" if is_team_reg else "Individual"
        text = f"""
ILWU Local 4 Golf Tournament - Registration Confirmation

Hello {player_name},

Your registration has been confirmed!

Registration Details:
- Type: {reg_type}
- Team Number: {team_number}
{f'- Status: Team Captain' if is_captain else ''}

Event Details:
- Location: Club Green Meadows
- Date: {EVENT_DATE}
- Price: ${total_cost} ({pricing_label} Rate)

PAYMENT INSTRUCTIONS:
Please complete your payment at:
- Local 4 Credit Union
- Or at the Hall

Thank you for registering! See you on the course.
ILWU Local 4
"""
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #1a365d; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1a365d 0%, #0f2342 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .header h1 {{ color: white; margin: 15px 0 5px; font-size: 24px; }}
        .header h2 {{ color: #f7dc00; margin: 0; font-size: 18px; }}
        .content {{ background: #f8f9fa; padding: 30px; }}
        .team-number {{ background: #1a365d; color: #f7dc00; font-size: 48px; font-weight: bold; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }}
        .team-label {{ color: white; font-size: 14px; text-transform: uppercase; }}
        .details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .details h3 {{ margin-top: 0; color: #1a365d; border-bottom: 2px solid #f7dc00; padding-bottom: 10px; }}
        .payment-box {{ background: #f7dc00; padding: 20px; border-radius: 8px; margin: 20px 0; }}
        .payment-box h3 {{ color: #1a365d; margin-top: 0; }}
        .payment-box p {{ color: #1a365d; margin: 0; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Registration Confirmed!</h1>
            <h2>ILWU Local 4 Golf Tournament</h2>
        </div>
        <div class="content">
            <p>Hello <strong>{player_name}</strong>,</p>
            <p>Your registration has been successfully submitted!</p>
            <div class="team-number">
                <div class="team-label">Your Team Number</div>
                {team_number}
            </div>
            {'<p style="text-align:center;"><strong>You are the Team Captain!</strong></p>' if is_captain else ''}
            <div class="details">
                <h3>Registration Details</h3>
                <p><strong>Type:</strong> {reg_type}</p>
                <p><strong>Team Number:</strong> {team_number}</p>
                <p><strong>Amount Due:</strong> ${total_cost} ({pricing_label} Rate)</p>
            </div>
            <div class="details">
                <h3>Event Details</h3>
                <p><strong>Location:</strong> Club Green Meadows</p>
                <p><strong>Date:</strong> {EVENT_DATE}</p>
                <p><strong>Format:</strong> Best Ball Scramble Shotgun start 4-Person Teams</p>
            </div>
            <div class="payment-box">
                <h3>Payment Instructions</h3>
                <p>Please complete your payment at:</p>
                <p><strong>Local 4 Credit Union</strong></p>
                <p><strong>Or at the Hall</strong></p>
            </div>
            <p style="text-align: center; margin-top: 30px;">See you on the course!</p>
        </div>
        <div class="footer">
            <p>ILWU Local 4 | International Longshore & Warehouse Union</p>
        </div>
    </div>
</body>
</html>
"""
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        msg.attach(part1)
        msg.attach(part2)
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Confirmation email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def send_payment_confirmation_email(to_email, player_name, team_number):
    if not EMAIL_ENABLED:
        return False
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"ILWU Local 4 Golf Tournament - Payment Received (Team {team_number})"
        msg['From'] = GMAIL_USER
        msg['To'] = to_email
        text = f"Hello {player_name},\n\nYour payment has been received! You're all set for the tournament.\n\nTeam: {team_number}\nDate: {EVENT_DATE}\nLocation: Club Green Meadows\n\nSee you on the course!\nILWU Local 4"
        html = f"""
<!DOCTYPE html>
<html><head><style>
body {{ font-family: Arial, sans-serif; color: #1a365d; }}
.container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
.header {{ background: linear-gradient(135deg, #2d5a27, #1a4020); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
.header h1 {{ color: white; font-size: 24px; margin: 0 0 5px; }}
.header h2 {{ color: #f7dc00; font-size: 18px; margin: 0; }}
.content {{ background: #f8f9fa; padding: 30px; }}
.details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }}
.details h3 {{ margin-top: 0; color: #1a365d; border-bottom: 2px solid #2d5a27; padding-bottom: 10px; }}
.footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
</style></head><body><div class="container">
<div class="header"><h1>Payment Received!</h1><h2>ILWU Local 4 Golf Tournament</h2></div>
<div class="content">
<p>Hello <strong>{player_name}</strong>,</p>
<p>Your payment has been confirmed. You're all set!</p>
<div class="details"><h3>Your Details</h3>
<p><strong>Team Number:</strong> {team_number}</p>
<p><strong>Location:</strong> Club Green Meadows</p>
<p><strong>Date:</strong> {EVENT_DATE}</p></div>
<p style="text-align:center">See you on the course!</p>
</div><div class="footer"><p>ILWU Local 4</p></div></div></body></html>"""
        msg.attach(MIMEText(text, 'plain'))
        msg.attach(MIMEText(html, 'html'))
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        logging.error(f"Failed to send payment email: {e}")
        return False

# Helper functions
async def get_next_registration_order():
    result = await db.players.find_one(sort=[("registration_order", -1)])
    if result:
        return result.get("registration_order", 0) + 1
    return 1

async def get_available_team_numbers():
    used_numbers = await db.teams.distinct("team_number")
    all_numbers = list(range(1, MAX_TEAMS + 1))
    return [n for n in all_numbers if n not in used_numbers]

async def assign_team_number():
    available = await get_available_team_numbers()
    if not available:
        return None
    return random.choice(available)

async def find_or_create_team_for_individual():
    team = await db.teams.find_one({"is_full": False, "players": {"$ne": []}}, sort=[("created_at", 1)])
    if team:
        return team
    team_count = await db.teams.count_documents({})
    if team_count >= MAX_TEAMS:
        team = await db.teams.find_one({"is_full": False}, sort=[("created_at", 1)])
        if team:
            return team
        return None
    team_number = await assign_team_number()
    if team_number is None:
        return None
    new_team = Team(team_number=team_number)
    team_dict = new_team.model_dump()
    await db.teams.insert_one(team_dict)
    return team_dict

async def verify_admin(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        import base64
        scheme, token = authorization.split(" ", 1)
        decoded = base64.b64decode(token).decode()
        username, password = decoded.split(":", 1)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    correct_username = secrets.compare_digest(username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return username

# Routes
@app.get("/api")
async def root():
    return {"message": "ILWU Local 4 Golf Tournament API"}

class AdminLoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/admin/login")
async def admin_login(data: AdminLoginRequest):
    import base64
    correct_username = secrets.compare_digest(data.username, ADMIN_USERNAME)
    correct_password = secrets.compare_digest(data.password, ADMIN_PASSWORD)
    if not (correct_username and correct_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = base64.b64encode(f"{data.username}:{data.password}".encode()).decode()
    return {"success": True, "token": token, "username": data.username}

@app.get("/api/email-status")
async def get_email_status():
    return {
        "email_enabled": EMAIL_ENABLED,
        "sender": GMAIL_USER if EMAIL_ENABLED else None,
        "message": "Email confirmations enabled" if EMAIL_ENABLED else "Email not configured"
    }

@app.get("/api/tournament-info")
async def get_tournament_info():
    total_teams = await db.teams.count_documents({})
    total_players = await db.players.count_documents({})
    full_teams = await db.teams.count_documents({"is_full": True})
    current_price = get_current_price()
    is_early_bird = datetime.now(timezone.utc) < EARLY_BIRD_DEADLINE
    return {
        "location": "Club Green Meadows",
        "date": EVENT_DATE,
        "price_per_player": current_price,
        "price_per_team": current_price * 4,
        "early_bird_price": EARLY_BIRD_PRICE,
        "regular_price": REGULAR_PRICE,
        "is_early_bird": is_early_bird,
        "early_bird_deadline": "June 20, 2026",
        "max_teams": MAX_TEAMS,
        "max_players_per_team": MAX_PLAYERS_PER_TEAM,
        "current_teams": total_teams,
        "current_players": total_players,
        "full_teams": full_teams,
        "registration_open": total_teams < MAX_TEAMS or full_teams < total_teams,
        "payment_info": "Payment can be made at Local 4 Credit Union or at the Hall"
    }

@app.get("/api/teams/available")
async def get_available_teams_for_join():
    teams = await db.teams.find({"is_full": False}, {"_id": 0}).sort("team_number", 1).to_list(100)
    result = []
    for team in teams:
        player_ids = team.get("players", [])
        if not player_ids:
            continue
        captain = await db.players.find_one({"id": {"$in": player_ids}, "is_captain": True}, {"_id": 0})
        if not captain:
            continue
        spots = MAX_PLAYERS_PER_TEAM - len(player_ids)
        if spots <= 0:
            continue
        result.append({
            "team_id": team["id"],
            "team_number": team["team_number"],
            "captain_name": f"{captain['first_name']} {captain['last_name']}",
            "spots_remaining": spots
        })
    return result

@app.post("/api/register/individual", response_model=RegistrationResponse)
async def register_individual(player_data: IndividualRegistration, background_tasks: BackgroundTasks):
    team_count = await db.teams.count_documents({})
    full_teams = await db.teams.count_documents({"is_full": True})
    if team_count >= MAX_TEAMS and full_teams >= MAX_TEAMS:
        raise HTTPException(status_code=400, detail="Registration is full. No spots available.")
    if player_data.team_id:
        team = await db.teams.find_one({"id": player_data.team_id}, {"_id": 0})
        if not team:
            raise HTTPException(status_code=400, detail="Selected team not found.")
        if team.get("is_full") or len(team.get("players", [])) >= MAX_PLAYERS_PER_TEAM:
            raise HTTPException(status_code=400, detail="Selected team is already full.")
    else:
        team = await find_or_create_team_for_individual()
        if not team:
            raise HTTPException(status_code=400, detail="No teams available. Registration is full.")
    is_captain = len(team.get("players", [])) == 0
    reg_order = await get_next_registration_order()
    player = Player(
        **player_data.model_dump(exclude={'team_id'}),
        team_id=team["id"],
        is_captain=is_captain,
        registration_order=reg_order
    )
    player_dict = player.model_dump()
    await db.players.insert_one(player_dict)
    new_players = team.get("players", []) + [player.id]
    is_full = len(new_players) >= MAX_PLAYERS_PER_TEAM
    await db.teams.update_one({"id": team["id"]}, {"$set": {"players": new_players, "is_full": is_full}})
    background_tasks.add_task(
        send_confirmation_email, player_data.email,
        f"{player_data.first_name} {player_data.last_name}",
        team["team_number"], is_captain, False, 1
    )
    return RegistrationResponse(
        success=True,
        message=f"Successfully registered! You have been assigned to Team {team['team_number']}." +
                (" You are the team captain!" if is_captain else ""),
        team_number=team["team_number"],
        player_ids=[player.id],
        is_captain=is_captain
    )

@app.post("/api/register/team", response_model=RegistrationResponse)
async def register_team(team_data: TeamRegistration, background_tasks: BackgroundTasks):
    if len(team_data.players) < 1 or len(team_data.players) > MAX_PLAYERS_PER_TEAM:
        raise HTTPException(status_code=400, detail=f"Team must have between 1 and {MAX_PLAYERS_PER_TEAM} players")
    team_count = await db.teams.count_documents({})
    if team_count >= MAX_TEAMS:
        raise HTTPException(status_code=400, detail="Maximum number of teams reached. Registration is full.")
    team_number = await assign_team_number()
    if team_number is None:
        raise HTTPException(status_code=400, detail="No team numbers available.")
    new_team = Team(team_number=team_number)
    team_dict = new_team.model_dump()
    await db.teams.insert_one(team_dict)
    player_ids = []
    for i, p_data in enumerate(team_data.players):
        reg_order = await get_next_registration_order()
        player = Player(
            **p_data.model_dump(),
            team_id=new_team.id,
            is_captain=(i == 0),
            registration_order=reg_order
        )
        player_dict = player.model_dump()
        await db.players.insert_one(player_dict)
        player_ids.append(player.id)
        background_tasks.add_task(
            send_confirmation_email, p_data.email,
            f"{p_data.first_name} {p_data.last_name}",
            team_number, (i == 0), True, len(team_data.players)
        )
    is_full = len(player_ids) >= MAX_PLAYERS_PER_TEAM
    await db.teams.update_one({"id": new_team.id}, {"$set": {"players": player_ids, "is_full": is_full}})
    return RegistrationResponse(
        success=True,
        message=f"Team successfully registered! Your team number is {team_number}.",
        team_number=team_number,
        player_ids=player_ids,
        is_captain=True
    )

@app.get("/api/teams", response_model=List[TeamWithPlayers])
async def get_all_teams():
    teams = await db.teams.find({}, {"_id": 0}).sort("team_number", 1).to_list(100)
    result = []
    for team in teams:
        player_ids = team.get("players", [])
        players = await db.players.find({"id": {"$in": player_ids}}, {"_id": 0}).to_list(10)
        players_sorted = sorted(players, key=lambda p: (not p.get("is_captain", False), p.get("registration_order", 0)))
        result.append(TeamWithPlayers(
            id=team["id"], team_number=team["team_number"],
            players=[Player(**p) for p in players_sorted],
            is_full=team.get("is_full", False),
            spots_remaining=MAX_PLAYERS_PER_TEAM - len(player_ids),
            score=team.get("score"),
            created_at=team.get("created_at", "")
        ))
    return result

@app.get("/api/admin/verify")
async def verify_admin_access(username: str = Depends(verify_admin)):
    return {"success": True, "username": username}

@app.get("/api/admin/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(username: str = Depends(verify_admin)):
    total_players = await db.players.count_documents({})
    total_teams = await db.teams.count_documents({})
    teams_full = await db.teams.count_documents({"is_full": True})
    total_possible_spots = MAX_TEAMS * MAX_PLAYERS_PER_TEAM
    spots_remaining = total_possible_spots - total_players
    unassigned = await db.players.count_documents({"team_id": None})
    paid = await db.players.count_documents({"payment_status": "paid"})
    checked_in = await db.players.count_documents({"checked_in": True})
    return DashboardStats(
        total_players=total_players, total_teams=total_teams,
        teams_full=teams_full, spots_remaining=spots_remaining,
        unassigned_players=unassigned,
        paid_players=paid,
        unpaid_players=total_players - paid,
        checked_in_players=checked_in
    )

@app.get("/api/admin/teams", response_model=List[TeamWithPlayers])
async def get_admin_teams(username: str = Depends(verify_admin)):
    return await get_all_teams()

@app.get("/api/admin/players")
async def get_all_players(username: str = Depends(verify_admin)):
    players = await db.players.find({}, {"_id": 0}).sort("registration_order", 1).to_list(500)
    for player in players:
        if player.get("team_id"):
            team = await db.teams.find_one({"id": player["team_id"]}, {"_id": 0})
            player["team_number"] = team["team_number"] if team else None
    return players

@app.delete("/api/admin/player/{player_id}")
async def delete_player(player_id: str, username: str = Depends(verify_admin)):
    player = await db.players.find_one({"id": player_id}, {"_id": 0})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    team_id = player.get("team_id")
    was_captain = player.get("is_captain", False)
    await db.players.delete_one({"id": player_id})
    if team_id:
        team = await db.teams.find_one({"id": team_id}, {"_id": 0})
        if team:
            new_players = [p for p in team.get("players", []) if p != player_id]
            if len(new_players) == 0:
                await db.teams.delete_one({"id": team_id})
            else:
                await db.teams.update_one({"id": team_id}, {"$set": {"players": new_players, "is_full": False}})
                if was_captain and new_players:
                    remaining = await db.players.find({"id": {"$in": new_players}}, {"_id": 0}).sort("registration_order", 1).to_list(10)
                    if remaining:
                        await db.players.update_one({"id": remaining[0]["id"]}, {"$set": {"is_captain": True}})
    return {"success": True, "message": "Player deleted successfully"}

@app.delete("/api/admin/team/{team_id}")
async def delete_team(team_id: str, username: str = Depends(verify_admin)):
    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    await db.players.delete_many({"team_id": team_id})
    await db.teams.delete_one({"id": team_id})
    return {"success": True, "message": f"Team {team['team_number']} and all its players deleted"}

@app.put("/api/admin/player/{player_id}/mark-paid")
async def mark_player_paid(player_id: str, background_tasks: BackgroundTasks, username: str = Depends(verify_admin)):
    player = await db.players.find_one({"id": player_id}, {"_id": 0})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    await db.players.update_one(
        {"id": player_id},
        {"$set": {"payment_status": "paid", "payment_date": datetime.now(timezone.utc).isoformat()}}
    )
    # Send payment confirmation email
    if player.get("team_id"):
        team = await db.teams.find_one({"id": player["team_id"]}, {"_id": 0})
        team_num = team["team_number"] if team else 0
        background_tasks.add_task(
            send_payment_confirmation_email,
            player["email"],
            f"{player['first_name']} {player['last_name']}",
            team_num
        )
    return {"success": True, "message": f"{player['first_name']} {player['last_name']} marked as paid"}

@app.put("/api/admin/player/{player_id}/mark-unpaid")
async def mark_player_unpaid(player_id: str, username: str = Depends(verify_admin)):
    player = await db.players.find_one({"id": player_id}, {"_id": 0})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    await db.players.update_one(
        {"id": player_id},
        {"$set": {"payment_status": "unpaid", "payment_date": None}}
    )
    return {"success": True, "message": f"{player['first_name']} {player['last_name']} marked as unpaid"}

@app.put("/api/admin/team/{team_id}/mark-all-paid")
async def mark_team_paid(team_id: str, username: str = Depends(verify_admin)):
    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    now = datetime.now(timezone.utc).isoformat()
    await db.players.update_many(
        {"team_id": team_id},
        {"$set": {"payment_status": "paid", "payment_date": now}}
    )
    return {"success": True, "message": f"All players on Team {team['team_number']} marked as paid"}

@app.post("/api/webhook/zeffy")
async def zeffy_webhook(request_data: dict = {}):
    logging.info(f"Zeffy webhook received: {request_data}")
    return {"status": "received"}

@app.put("/api/admin/player/{player_id}/check-in")
async def check_in_player(player_id: str, username: str = Depends(verify_admin)):
    player = await db.players.find_one({"id": player_id}, {"_id": 0})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    await db.players.update_one(
        {"id": player_id},
        {"$set": {"checked_in": True, "checkin_time": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True, "message": f"{player['first_name']} {player['last_name']} checked in"}

@app.put("/api/admin/player/{player_id}/undo-check-in")
async def undo_check_in_player(player_id: str, username: str = Depends(verify_admin)):
    player = await db.players.find_one({"id": player_id}, {"_id": 0})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    await db.players.update_one(
        {"id": player_id},
        {"$set": {"checked_in": False, "checkin_time": None}}
    )
    return {"success": True, "message": f"{player['first_name']} {player['last_name']} check-in undone"}

class TeamScore(BaseModel):
    score: int

@app.put("/api/admin/team/{team_id}/score")
async def set_team_score(team_id: str, data: TeamScore, username: str = Depends(verify_admin)):
    team = await db.teams.find_one({"id": team_id}, {"_id": 0})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    await db.teams.update_one({"id": team_id}, {"$set": {"score": data.score}})
    return {"success": True, "message": f"Team {team['team_number']} score set to {data.score}"}

@app.get("/api/leaderboard")
async def get_leaderboard():
    teams = await db.teams.find({}, {"_id": 0}).to_list(100)
    result = []
    for team in teams:
        player_ids = team.get("players", [])
        players = await db.players.find({"id": {"$in": player_ids}}, {"_id": 0, "email": 0, "phone": 0}).to_list(10)
        captain = next((p for p in players if p.get("is_captain")), None)
        result.append({
            "team_number": team["team_number"],
            "score": team.get("score"),
            "captain_name": f"{captain['first_name']} {captain['last_name']}" if captain else "",
            "player_count": len(players),
            "player_names": [f"{p['first_name']} {p['last_name']}" for p in players]
        })
    scored = sorted([t for t in result if t["score"] is not None], key=lambda x: x["score"])
    unscored = [t for t in result if t["score"] is None]
    return scored + unscored

@app.get("/api/admin/export/csv")
async def export_registrations_csv(username: str = Depends(verify_admin)):
    players = await db.players.find({}, {"_id": 0}).sort("registration_order", 1).to_list(500)
    for player in players:
        if player.get("team_id"):
            team = await db.teams.find_one({"id": player["team_id"]}, {"_id": 0})
            player["team_number"] = team["team_number"] if team else "N/A"
        else:
            player["team_number"] = "N/A"
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Registration #", "Team #", "Captain", "First Name", "Last Name", "Email", "Phone", "Association", "Registered At"])
    for player in players:
        writer.writerow([
            player.get("registration_order", ""), player.get("team_number", "N/A"),
            "Yes" if player.get("is_captain", False) else "No",
            player.get("first_name", ""), player.get("last_name", ""),
            player.get("email", ""), player.get("phone", ""),
            player.get("association", ""),
            player.get("created_at", "")[:10] if player.get("created_at") else ""
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=ilwu_golf_registrations_{datetime.now().strftime('%Y%m%d')}.csv"}
    )

@app.get("/api/admin/export/teams-csv")
async def export_teams_csv(username: str = Depends(verify_admin)):
    teams = await db.teams.find({}, {"_id": 0}).sort("team_number", 1).to_list(100)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Team #", "Status", "Players", "Captain", "Captain Email", "Captain Phone", "Captain Paid", "Player 2", "P2 Paid", "Player 3", "P3 Paid", "Player 4", "P4 Paid"])
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
            captain.get("phone", "") if captain else "",
            captain.get("payment_status", "unpaid").capitalize() if captain else ""
        ]
        for i in range(1, 4):
            if i < len(players_sorted):
                p = players_sorted[i]
                row.append(f"{p['first_name']} {p['last_name']}")
                row.append(p.get("payment_status", "unpaid").capitalize())
            else:
                row.append("")
                row.append("")
        writer.writerow(row)
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=ilwu_golf_teams_{datetime.now().strftime('%Y%m%d')}.csv"}
    )

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
