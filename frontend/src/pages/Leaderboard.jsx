import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Award, Gift, Users, Home, ArrowLeft } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';
const LOGO_URL = "/images/ilwu_logo.png";

export default function Leaderboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/leaderboard`)
      .then(res => setTeams(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const scored = teams.filter(t => t.score !== null);
  const unscored = teams.filter(t => t.score === null);

  const getRankStyle = (index) => {
    if (index === 0) return { bg: "from-[#f7dc00] to-[#d4b800]", text: "text-[#1a365d]", icon: <Trophy className="h-8 w-8" /> };
    if (index === 1) return { bg: "from-[#c0c0c0] to-[#a8a8a8]", text: "text-[#1a365d]", icon: <Award className="h-8 w-8" /> };
    if (index === 2) return { bg: "from-[#cd7f32] to-[#b36b2a]", text: "text-white", icon: <Award className="h-8 w-8" /> };
    return { bg: "from-slate-200 to-slate-300", text: "text-slate-700", icon: null };
  };

  const lastPlace = scored.length > 3 ? scored[scored.length - 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f2342] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f7dc00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f2342]">
      {/* Header */}
      <header className="bg-[#1a365d] border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ILWU" className="w-10 h-10 rounded-full border-2 border-[#f7dc00]" />
            <div>
              <h1 className="font-heading text-xl font-bold text-white uppercase">Leaderboard</h1>
              <p className="text-white/50 text-xs">ILWU Local 4 Golf Tournament</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" data-testid="leaderboard-home-btn">
              <Home className="h-4 w-4 mr-1" /> Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {scored.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 text-[#f7dc00]/30 mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Scores Coming Soon</h2>
              <p className="text-white/50">Check back during the tournament for live standings!</p>
              <p className="text-white/30 text-sm mt-2">September 3, 2026 - Club Green Meadows</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 mb-8 items-end">
              {/* 2nd Place */}
              {scored.length > 1 && (
                <Card className="overflow-hidden border-0 shadow-xl" data-testid="leaderboard-2nd">
                  <div className={`bg-gradient-to-br ${getRankStyle(1).bg} p-6 text-center`}>
                    <p className="text-sm font-bold uppercase text-slate-600 mb-1">2nd</p>
                    {getRankStyle(1).icon}
                    <p className={`font-heading text-3xl font-bold ${getRankStyle(1).text} mt-2`}>{scored[1].score}</p>
                  </div>
                  <div className="p-3 bg-white text-center">
                    <p className="font-bold text-[#1a365d]">Team {scored[1].team_number}</p>
                    <p className="text-xs text-slate-500">{scored[1].captain_name}</p>
                  </div>
                </Card>
              )}

              {/* 1st Place */}
              {scored.length > 0 && (
                <Card className="overflow-hidden border-0 shadow-2xl scale-110 z-10" data-testid="leaderboard-1st">
                  <div className={`bg-gradient-to-br ${getRankStyle(0).bg} p-8 text-center`}>
                    <p className="text-sm font-bold uppercase text-[#1a365d]/70 mb-1">1st</p>
                    {getRankStyle(0).icon}
                    <p className={`font-heading text-4xl font-bold ${getRankStyle(0).text} mt-2`}>{scored[0].score}</p>
                  </div>
                  <div className="p-3 bg-white text-center">
                    <p className="font-bold text-[#1a365d]">Team {scored[0].team_number}</p>
                    <p className="text-xs text-slate-500">{scored[0].captain_name}</p>
                  </div>
                </Card>
              )}

              {/* 3rd Place */}
              {scored.length > 2 && (
                <Card className="overflow-hidden border-0 shadow-xl" data-testid="leaderboard-3rd">
                  <div className={`bg-gradient-to-br ${getRankStyle(2).bg} p-6 text-center`}>
                    <p className="text-sm font-bold uppercase text-white/70 mb-1">3rd</p>
                    {getRankStyle(2).icon}
                    <p className={`font-heading text-3xl font-bold ${getRankStyle(2).text} mt-2`}>{scored[2].score}</p>
                  </div>
                  <div className="p-3 bg-white text-center">
                    <p className="font-bold text-[#1a365d]">Team {scored[2].team_number}</p>
                    <p className="text-xs text-slate-500">{scored[2].captain_name}</p>
                  </div>
                </Card>
              )}
            </div>

            {/* Full Standings */}
            <Card className="bg-white/5 border-white/10 overflow-hidden mb-6">
              <div className="bg-[#1a365d] px-6 py-3">
                <h3 className="font-heading text-lg font-bold text-white uppercase">Full Standings</h3>
              </div>
              <div className="divide-y divide-white/5">
                {scored.map((team, idx) => (
                  <div key={team.team_number} className="flex items-center justify-between px-6 py-4" data-testid={`leaderboard-row-${team.team_number}`}>
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0 ? "bg-[#f7dc00] text-[#1a365d]" :
                        idx === 1 ? "bg-[#c0c0c0] text-[#1a365d]" :
                        idx === 2 ? "bg-[#cd7f32] text-white" :
                        "bg-white/10 text-white/60"
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-white">Team {team.team_number}</p>
                        <p className="text-white/40 text-xs">{team.player_names.join(", ")}</p>
                      </div>
                    </div>
                    <span className="font-heading text-2xl font-bold text-[#f7dc00]">{team.score}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Last Place */}
            {lastPlace && (
              <Card className="bg-white/5 border-white/10 overflow-hidden" data-testid="leaderboard-last">
                <div className="bg-gradient-to-r from-[#1a365d] to-[#0f2342] p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gift className="h-8 w-8 text-[#f7dc00]" />
                    <div>
                      <p className="text-sm font-bold uppercase text-white/50">Last Place Prize</p>
                      <p className="font-heading text-xl font-bold text-white">Team {lastPlace.team_number}</p>
                      <p className="text-white/40 text-xs">{lastPlace.captain_name}</p>
                    </div>
                  </div>
                  <span className="font-heading text-3xl font-bold text-[#f7dc00]">{lastPlace.score}</span>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Unscored teams */}
        {unscored.length > 0 && scored.length > 0 && (
          <div className="mt-6">
            <p className="text-white/30 text-sm text-center mb-3">Awaiting Scores</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {unscored.map(team => (
                <span key={team.team_number} className="bg-white/5 text-white/40 text-sm px-3 py-1 rounded-full">
                  Team {team.team_number}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
