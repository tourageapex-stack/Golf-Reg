"""Unit tests for the rain-or-shine announcement email template."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "api"))

from email_templates import ANNOUNCEMENT_SUBJECT, build_announcement_email


class TestAnnouncementEmail:
    def test_subject_mentions_rain_or_shine(self):
        subject, text, html = build_announcement_email("Jane Doe", 7, 7)
        assert subject == ANNOUNCEMENT_SUBJECT
        assert "Thursday 9/3" in subject
        assert "Rain or Shine" in subject

    def test_plain_text_covers_the_announcement(self):
        _, text, _ = build_announcement_email("Jane Doe", 7, 7)
        assert "Hello Jane Doe" in text
        assert "rain or shine" in text.lower()
        assert "looks like rain" in text.lower()
        assert "come prepared" in text.lower()
        assert "Check-in: 7:00 AM" in text
        assert "Tee off: 8:00 AM" in text
        assert "Team Number: 7" in text
        assert "Starting Hole: 7" in text
        assert "Club Green Meadows" in text

    def test_html_matches_confirmation_look(self):
        _, _, html = build_announcement_email("Jane Doe", 7, 7)
        assert "#1a365d" in html
        assert "#f7dc00" in html
        assert "linear-gradient" in html
        assert "Your Team Number" in html
        assert ">7<" in html or "\n                7\n" in html
        assert "Come Prepared" in html
        assert "Check-in 7:00 AM" in html
        assert "Tee off 8:00 AM" in html
        assert "ILWU Logo" in html
        assert "customer-assets.emergentagent.com" in html

    def test_html_escapes_player_name(self):
        _, _, html = build_announcement_email("<script>alert(1)</script>", 1, 1)
        assert "<script>alert(1)</script>" not in html
        assert "&lt;script&gt;alert(1)&lt;/script&gt;" in html

    def test_overflow_team_notes_second_group(self):
        _, text, html = build_announcement_email("Pat Smith", 19, 2)
        assert "2nd team on this hole" in text
        assert "2nd team on this hole" in html
        assert "Starting Hole: 2" in text

    def test_works_without_team_assignment(self):
        _, text, html = build_announcement_email("Guest Player")
        assert "Team Number" not in text
        assert "Your Team Number" not in html
        assert "Hello Guest Player" in text
        assert "rain or shine" in html.lower()
