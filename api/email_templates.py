"""HTML/text builders for tournament emails. No I/O — safe to unit test."""
import html as html_lib
from typing import Optional, Tuple

LOGO_URL = "https://customer-assets.emergentagent.com/job_greenmeadows-golf/artifacts/n4xo0dyh_IMG_1411.png"
EVENT_DATE_LONG = "Thursday, September 3, 2026"
EVENT_DATE_SHORT = "Thursday 9/3"
CHECK_IN = "7:00 AM"
TEE_OFF = "8:00 AM"
LOCATION = "Club Green Meadows"

ANNOUNCEMENT_SUBJECT = "ILWU Local 4 Golf Tournament — Thursday 9/3 Rain or Shine"


def build_announcement_email(
    player_name: str,
    team_number: Optional[int] = None,
    starting_hole: Optional[int] = None,
) -> Tuple[str, str, str]:
    """Return (subject, plain_text, html) matching the registration confirmation look."""
    safe_name = html_lib.escape(player_name or "Golfer")
    hole_suffix = ""
    hole_line_text = ""
    hole_line_html = ""
    team_line_text = ""
    team_line_html = ""
    team_hero_html = ""

    if team_number:
        hole_suffix = " (2nd team on this hole)" if team_number > 18 else ""
        team_line_text = f"- Team Number: {team_number}\n"
        team_line_html = f"<p><strong>Team Number:</strong> {team_number}</p>"
        team_hero_html = f"""
            <div class="team-number">
                <div class="team-label">Your Team Number</div>
                {team_number}
            </div>
        """
        if starting_hole:
            hole_line_text = f"- Starting Hole: {starting_hole}{hole_suffix}\n"
            hole_line_html = f"<p><strong>Starting Hole:</strong> {starting_hole}{hole_suffix}</p>"

    text = f"""
ILWU Local 4 Golf Tournament
{EVENT_DATE_LONG} — Rain or Shine

Hello {player_name or "Golfer"},

The tournament will be {EVENT_DATE_SHORT} rain or shine.

Unfortunately, it looks like rain. Please come prepared with rain gear.

Event Details:
- Location: {LOCATION}
- Date: {EVENT_DATE_LONG}
- Check-in: {CHECK_IN}
- Tee off: {TEE_OFF}
{team_line_text}{hole_line_text}
See you on the course!

ILWU Local 4
"""

    html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #1a365d; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1a365d 0%, #0f2342 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .header img {{ width: 80px; height: 80px; border-radius: 50%; border: 3px solid #f7dc00; }}
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
        .schedule {{ display: block; background: #1a365d; color: #f7dc00; font-weight: bold; text-align: center; padding: 12px; border-radius: 8px; margin: 12px 0 0; letter-spacing: 0.5px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{LOGO_URL}" alt="ILWU Logo">
            <h1>Tournament Update</h1>
            <h2>ILWU Local 4 Golf Tournament</h2>
        </div>
        <div class="content">
            <p>Hello <strong>{safe_name}</strong>,</p>
            <p>The tournament will be <strong>{EVENT_DATE_SHORT} rain or shine</strong>.</p>

            {team_hero_html}

            <div class="details">
                <h3>Event Details</h3>
                <p><strong>Location:</strong> {LOCATION}</p>
                <p><strong>Date:</strong> {EVENT_DATE_LONG}</p>
                <p><strong>Check-in:</strong> {CHECK_IN}</p>
                <p><strong>Tee off:</strong> {TEE_OFF}</p>
                {team_line_html}
                {hole_line_html}
                <span class="schedule">Check-in {CHECK_IN} &nbsp;·&nbsp; Tee off {TEE_OFF}</span>
            </div>

            <div class="payment-box">
                <h3>Come Prepared — Rain Expected</h3>
                <p>Unfortunately, it looks like rain. Please come prepared with rain gear. We're playing either way.</p>
            </div>

            <p style="text-align: center; margin-top: 30px;">See you on the course!</p>
        </div>
        <div class="footer">
            <p>ILWU Local 4 | International Longshore &amp; Warehouse Union</p>
            <p>Questions? Contact us at the Hall.</p>
        </div>
    </div>
</body>
</html>
"""
    return ANNOUNCEMENT_SUBJECT, text, html
