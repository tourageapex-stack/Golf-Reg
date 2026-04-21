import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserCheck, UserX, Search, ArrowLeft, Users, CheckCircle } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';
const LOGO_URL = "/images/ilwu_logo.png";

export default function CheckIn() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const getAuthHeader = useCallback(() => {
    const auth = sessionStorage.getItem("adminAuth");
    if (!auth) {
      navigate("/admin");
      return null;
    }
    return { Authorization: `Bearer ${auth}` };
  }, [navigate]);

  const fetchData = useCallback(async () => {
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      const [teamsRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/teams`, { headers }),
        axios.get(`${API}/admin/dashboard`, { headers })
      ]);
      setTeams(teamsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      if (error.response?.status === 401) navigate("/admin");
      else toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleCheckIn = async (playerId, isCheckedIn) => {
    const headers = getAuthHeader();
    if (!headers) return;
    const action = isCheckedIn ? "undo-check-in" : "check-in";
    try {
      await axios.put(`${API}/admin/player/${playerId}/${action}`, {}, { headers });
      toast.success(isCheckedIn ? "Check-in undone" : "Checked in!");
      fetchData();
    } catch (error) {
      toast.error("Failed to update check-in");
    }
  };

  const filteredTeams = teams.map(team => ({
    ...team,
    players: team.players.filter(p => 
      !search || 
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      String(team.team_number).includes(search)
    )
  })).filter(team => team.players.length > 0);

  const totalPlayers = teams.reduce((acc, t) => acc + t.players.length, 0);
  const checkedIn = teams.reduce((acc, t) => acc + t.players.filter(p => p.checked_in).length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a365d]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-[#1a365d] text-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ILWU" className="w-10 h-10 rounded-full border-2 border-[#f7dc00]" />
            <div>
              <h1 className="font-heading text-xl font-bold uppercase">Check-In</h1>
              <p className="text-white/60 text-xs">ILWU Local 4 Golf Tournament</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" data-testid="back-to-dashboard-btn">
                <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-[#1a365d]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Total Players</p>
                <p className="text-2xl font-bold text-[#1a365d]">{totalPlayers}</p>
              </div>
              <Users className="h-8 w-8 text-[#1a365d]/20" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-[#2d5a27]">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Checked In</p>
                <p className="text-2xl font-bold text-[#2d5a27]">{checkedIn}</p>
              </div>
              <UserCheck className="h-8 w-8 text-[#2d5a27]/30" />
            </CardContent>
          </Card>
          <Card className="border-l-4 border-red-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Not Here</p>
                <p className="text-2xl font-bold text-red-500">{totalPlayers - checkedIn}</p>
              </div>
              <UserX className="h-8 w-8 text-red-500/30" />
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search by name or team number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 text-lg bg-white"
            data-testid="checkin-search-input"
          />
        </div>

        {/* Teams */}
        <div className="space-y-4">
          {filteredTeams.map(team => (
            <Card key={team.id} className="overflow-hidden" data-testid={`checkin-team-${team.team_number}`}>
              <div className="bg-[#1a365d] px-4 py-3 flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold text-white">
                  Team {team.team_number}
                </h3>
                <span className="text-sm text-white/60">
                  {team.players.filter(p => p.checked_in).length}/{team.players.length} checked in
                </span>
              </div>
              <CardContent className="p-0">
                {team.players.map(player => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between px-4 py-3 border-b last:border-b-0 transition-colors ${
                      player.checked_in ? "bg-[#2d5a27]/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        player.checked_in ? "bg-[#2d5a27] text-white" : "bg-slate-200 text-slate-500"
                      }`}>
                        {player.checked_in ? <CheckCircle className="h-5 w-5" /> : <UserX className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-[#1a365d]">
                          {player.first_name} {player.last_name}
                          {player.is_captain && <span className="ml-2 text-xs bg-[#f7dc00] text-[#1a365d] px-2 py-0.5 rounded-full font-bold">Captain</span>}
                        </p>
                        <p className={`text-xs ${player.payment_status === "paid" ? "text-[#2d5a27]" : "text-red-500"}`}>
                          {player.payment_status === "paid" ? "Paid" : "Unpaid"}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => toggleCheckIn(player.id, player.checked_in)}
                      variant={player.checked_in ? "outline" : "default"}
                      size="sm"
                      className={player.checked_in 
                        ? "border-[#2d5a27] text-[#2d5a27] hover:bg-[#2d5a27]/10" 
                        : "bg-[#1a365d] hover:bg-[#0f2342]"}
                      data-testid={`checkin-toggle-${player.id}`}
                    >
                      {player.checked_in ? "Undo" : "Check In"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
