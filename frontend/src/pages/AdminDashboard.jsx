import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Trophy, LogOut, Trash2, Crown, Home, 
  RefreshCw, CheckCircle, AlertCircle, Download, FileSpreadsheet,
  DollarSign, XCircle, UserCheck, Printer, BarChart3, Target, Zap, Star, Gift, Plus, Flag
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';
const LOGO_URL = "/images/ilwu_logo.png";

// Build a hole-indexed structure: [{ hole: 1, teams: [teamA, teamB?] }, ...]
// Teams assigned to holes 1-7 may have a 2nd team (overflow teams 19-25)
function buildHoleGroupings(teams) {
  const byHole = new Map();
  for (let h = 1; h <= 18; h++) byHole.set(h, []);
  for (const t of teams) {
    if (t.starting_hole && byHole.has(t.starting_hole)) {
      byHole.get(t.starting_hole).push(t);
    }
  }
  // Sort each hole so primary team (team_number <= 18) comes first
  for (const list of byHole.values()) {
    list.sort((a, b) => {
      const aPrimary = a.team_number <= 18 ? 0 : 1;
      const bPrimary = b.team_number <= 18 ? 0 : 1;
      if (aPrimary !== bPrimary) return aPrimary - bPrimary;
      return a.team_number - b.team_number;
    });
  }
  return Array.from(byHole.entries()).map(([hole, teams]) => ({ hole, teams }));
}

function HoleGroupingsView({ teams, onPrint }) {
  const groupings = buildHoleGroupings(teams);
  const unassigned = teams.filter(t => !t.starting_hole);
  const totalAssigned = teams.filter(t => t.starting_hole).length;

  return (
    <div className="space-y-6" data-testid="hole-groupings-view">
      {/* Summary + Print */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-[#1a365d] to-[#0f2342] text-white">
        <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#f7dc00] rounded-xl flex items-center justify-center shrink-0 rotate-3 shadow-md">
              <Flag className="h-7 w-7 text-[#1a365d]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#f7dc00]">Shotgun Start Layout</p>
              <p className="font-heading text-xl md:text-2xl font-bold leading-tight">
                {totalAssigned} team{totalAssigned !== 1 ? 's' : ''} assigned across 18 holes
              </p>
              <p className="text-xs text-white/70 mt-1">
                Holes 1-7 have two groups (2nd group tees off after 1st clears the hole)
              </p>
            </div>
          </div>
          <Button
            onClick={onPrint}
            disabled={totalAssigned === 0}
            className="bg-[#f7dc00] text-[#1a365d] hover:bg-[#ffe55c] font-bold uppercase tracking-wide"
            data-testid="print-hole-groupings-btn"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Layout
          </Button>
        </CardContent>
      </Card>

      {/* Hole Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="hole-grid">
        {groupings.map(({ hole, teams: holeTeams }) => {
          const hasOverflow = holeTeams.length > 1;
          const isEmpty = holeTeams.length === 0;
          return (
            <Card
              key={hole}
              className={`shadow-md hover:shadow-lg transition-shadow border-l-4 ${
                isEmpty ? 'border-slate-200 bg-slate-50' : hasOverflow ? 'border-[#f7dc00] bg-[#f7dc00]/5' : 'border-[#1a365d]'
              }`}
              data-testid={`hole-card-${hole}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#1a365d] text-[#f7dc00] rounded-lg flex items-center justify-center shrink-0 font-heading font-bold text-lg">
                      {hole}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hole</p>
                      <p className="font-heading text-sm font-bold text-[#1a365d]">
                        {holeTeams.length} / {hole <= 7 ? 2 : 1} groups
                      </p>
                    </div>
                  </div>
                  {hasOverflow && (
                    <Badge className="bg-[#f7dc00] text-[#1a365d] hover:bg-[#f7dc00]">Shared</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {isEmpty ? (
                  <p className="text-xs text-slate-400 italic py-2">No team assigned</p>
                ) : (
                  holeTeams.map((t, idx) => {
                    const captain = t.players?.find(p => p.is_captain);
                    const position = holeTeams.length > 1 ? (idx === 0 ? '1st' : '2nd') : null;
                    return (
                      <div
                        key={t.id}
                        className={`rounded-lg p-3 border ${
                          position === '2nd' ? 'bg-[#f7dc00]/20 border-[#f7dc00]' : 'bg-white border-slate-200'
                        }`}
                        data-testid={`hole-${hole}-team-${t.team_number}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {position && (
                              <span className="text-[9px] font-bold uppercase tracking-widest bg-[#1a365d] text-[#f7dc00] px-1.5 py-0.5 rounded">
                                {position}
                              </span>
                            )}
                            <span className="font-heading font-bold text-[#1a365d]">Team {t.team_number}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {(t.players || []).length} player{(t.players || []).length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {captain && (
                          <p className="text-xs text-slate-600 flex items-center gap-1">
                            <Crown className="h-3 w-3 text-[#f7dc00]" />
                            {captain.first_name} {captain.last_name}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {unassigned.length > 0 && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="p-4 text-sm text-orange-900">
            <strong>Note:</strong> {unassigned.length} team{unassigned.length !== 1 ? 's have' : ' has'} no starting hole assigned (legacy data). Re-register or edit to assign.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [raffles, setRaffles] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, id: null, name: "" });
  const [newCompetition, setNewCompetition] = useState({ competition_type: "long_drive", winner_name: "", details: "" });
  const [newRaffle, setNewRaffle] = useState({ winner_name: "", prize: "" });

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

    setLoading(true);
    try {
      const [statsRes, teamsRes, playersRes, compsRes, rafflesRes] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, { headers }),
        axios.get(`${API}/admin/teams`, { headers }),
        axios.get(`${API}/admin/players`, { headers }),
        axios.get(`${API}/competitions`),
        axios.get(`${API}/raffles`)
      ]);
      
      setStats(statsRes.data);
      setTeams(teamsRes.data);
      setPlayers(playersRes.data);
      setCompetitions(compsRes.data);
      setRaffles(rafflesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        sessionStorage.removeItem("adminAuth");
        navigate("/admin");
      } else {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    navigate("/admin");
  };

  const handleExport = async (type) => {
    const auth = sessionStorage.getItem("adminAuth");
    if (!auth) return;
    
    try {
      const endpoint = type === "players" ? "export/csv" : "export/teams-csv";
      const response = await fetch(`${API}/admin/${endpoint}`, {
        headers: { Authorization: `Bearer ${auth}` }
      });
      
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "players" 
        ? `ilwu_golf_registrations_${new Date().toISOString().split('T')[0]}.csv`
        : `ilwu_golf_teams_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success(`${type === "players" ? "Players" : "Teams"} exported successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  const handleDelete = async () => {
    const headers = getAuthHeader();
    if (!headers) return;

    try {
      if (deleteDialog.type === "player") {
        await axios.delete(`${API}/admin/player/${deleteDialog.id}`, { headers });
        toast.success("Player deleted successfully");
      } else if (deleteDialog.type === "team") {
        await axios.delete(`${API}/admin/team/${deleteDialog.id}`, { headers });
        toast.success("Team deleted successfully");
      }
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete");
    } finally {
      setDeleteDialog({ open: false, type: null, id: null, name: "" });
    }
  };

  const togglePayment = async (playerId, currentStatus) => {
    const headers = getAuthHeader();
    if (!headers) return;
    const action = currentStatus === "paid" ? "mark-unpaid" : "mark-paid";
    try {
      await axios.put(`${API}/admin/player/${playerId}/${action}`, {}, { headers });
      toast.success(currentStatus === "paid" ? "Marked as unpaid" : "Marked as paid");
      fetchData();
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

  const markTeamPaid = async (teamId) => {
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      await axios.put(`${API}/admin/team/${teamId}/mark-all-paid`, {}, { headers });
      toast.success("All team members marked as paid");
      fetchData();
    } catch (error) {
      toast.error("Failed to update payment status");
    }
  };

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

  const updateTeamScore = async (teamId, score) => {
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      await axios.put(`${API}/admin/team/${teamId}/score`, { score: parseInt(score) }, { headers });
      toast.success("Score updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update score");
    }
  };

  const addCompetition = async () => {
    if (!newCompetition.winner_name) { toast.error("Enter winner name"); return; }
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      await axios.post(`${API}/admin/competition`, newCompetition, { headers });
      toast.success("Competition result added");
      setNewCompetition({ competition_type: "long_drive", winner_name: "", details: "" });
      fetchData();
    } catch (error) { toast.error("Failed to add result"); }
  };

  const deleteCompetition = async (id) => {
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      await axios.delete(`${API}/admin/competition/${id}`, { headers });
      toast.success("Result deleted");
      fetchData();
    } catch (error) { toast.error("Failed to delete"); }
  };

  const addRaffle = async () => {
    if (!newRaffle.winner_name || !newRaffle.prize) { toast.error("Enter winner name and prize"); return; }
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      await axios.post(`${API}/admin/raffle`, newRaffle, { headers });
      toast.success("Raffle winner added");
      setNewRaffle({ winner_name: "", prize: "" });
      fetchData();
    } catch (error) { toast.error("Failed to add winner"); }
  };

  const deleteRaffle = async (id) => {
    const headers = getAuthHeader();
    if (!headers) return;
    try {
      await axios.delete(`${API}/admin/raffle/${id}`, { headers });
      toast.success("Winner deleted");
      fetchData();
    } catch (error) { toast.error("Failed to delete"); }
  };

  const printRoster = () => {
    const printWindow = window.open('', '_blank');
    const content = teams.map(team => {
      const playerRows = team.players.map((p, i) => 
        `<tr>
          <td style="padding:6px 12px;border:1px solid #ddd">${i + 1}</td>
          <td style="padding:6px 12px;border:1px solid #ddd">${p.first_name} ${p.last_name}${p.is_captain ? ' (Captain)' : ''}</td>
          <td style="padding:6px 12px;border:1px solid #ddd">${p.phone}</td>
          <td style="padding:6px 12px;border:1px solid #ddd">${p.payment_status === 'paid' ? 'Paid' : 'Unpaid'}</td>
          <td style="padding:6px 12px;border:1px solid #ddd">${p.checked_in ? 'Yes' : 'No'}</td>
        </tr>`
      ).join('');
      return `
        <div style="margin-bottom:24px;page-break-inside:avoid">
          <h2 style="background:#1a365d;color:white;padding:8px 12px;margin:0;font-size:16px">
            Team ${team.team_number}${team.starting_hole ? ` — Hole ${team.starting_hole}${team.team_number > 18 ? ' (2nd)' : ''}` : ''} ${team.score !== null && team.score !== undefined ? `— Score: ${team.score}` : ''}
          </h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <tr style="background:#f0f0f0">
              <th style="padding:6px 12px;border:1px solid #ddd;text-align:left">#</th>
              <th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Name</th>
              <th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Phone</th>
              <th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Payment</th>
              <th style="padding:6px 12px;border:1px solid #ddd;text-align:left">Checked In</th>
            </tr>
            ${playerRows}
          </table>
        </div>`;
    }).join('');
    printWindow.document.write(`
      <html><head><title>ILWU Local 4 Golf Tournament - Team Roster</title></head>
      <body style="font-family:Arial,sans-serif;padding:20px">
        <h1 style="text-align:center;color:#1a365d;margin-bottom:4px">ILWU Local 4 Golf Tournament</h1>
        <p style="text-align:center;color:#666;margin-top:0">Team Roster — Club Green Meadows — September 3, 2026</p>
        <hr style="margin:16px 0">
        ${content}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const printHoleGroupings = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const holes = buildHoleGroupings(teams);
    const rows = holes.map(h => {
      const teamsHtml = h.teams.length === 0
        ? `<td colspan="2" style="padding:8px 12px;border:1px solid #ddd;color:#999;font-style:italic">No team assigned</td>`
        : h.teams.map((t, idx) => {
            const captain = t.players?.find(p => p.is_captain);
            const label = h.teams.length > 1 ? (idx === 0 ? '1st' : '2nd') : '';
            return `<td style="padding:8px 12px;border:1px solid #ddd;vertical-align:top">
              ${label ? `<div style="font-size:10px;font-weight:bold;color:#f7dc00;background:#1a365d;display:inline-block;padding:2px 6px;border-radius:3px;margin-bottom:4px">${label} GROUP</div><br>` : ''}
              <strong>Team ${t.team_number}</strong>
              ${captain ? `<br><span style="color:#666;font-size:12px">Captain: ${captain.first_name} ${captain.last_name}</span>` : ''}
              <br><span style="color:#666;font-size:11px">${(t.players || []).length} player${(t.players || []).length !== 1 ? 's' : ''}</span>
            </td>`;
          }).join('') + (h.teams.length === 1 ? `<td style="padding:8px 12px;border:1px solid #ddd;color:#999;font-style:italic">—</td>` : '');
      return `<tr>
        <td style="padding:8px 12px;border:1px solid #ddd;background:#f7dc00;font-weight:bold;width:80px;text-align:center;font-size:18px">HOLE ${h.hole}</td>
        ${teamsHtml}
      </tr>`;
    }).join('');
    printWindow.document.write(`
      <html><head><title>Starting Hole Groupings - ILWU Local 4 Golf Tournament</title></head>
      <body style="font-family:Arial,sans-serif;padding:20px">
        <h1 style="text-align:center;color:#1a365d;margin-bottom:4px">Starting Hole Groupings</h1>
        <p style="text-align:center;color:#666;margin-top:0">ILWU Local 4 Golf Tournament — Club Green Meadows — September 3, 2026</p>
        <p style="text-align:center;color:#666;margin-top:0;font-size:12px">Shotgun start 8:00 AM · Holes 1-7 have two groups (2nd group starts after 1st)</p>
        <hr style="margin:16px 0">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="background:#1a365d;color:white">
            <th style="padding:8px;border:1px solid #1a365d">Hole</th>
            <th style="padding:8px;border:1px solid #1a365d;text-align:left">1st Group</th>
            <th style="padding:8px;border:1px solid #1a365d;text-align:left">2nd Group</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-[#1a365d] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#1a365d] py-4 shadow-lg">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="ILWU Logo" className="w-10 h-10 rounded-full border-2 border-[#f7dc00]" />
            <div>
              <h1 className="font-heading text-xl font-bold text-white uppercase">Admin Dashboard</h1>
              <p className="text-white/60 text-sm">ILWU Local 4 Golf Tournament</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="text-white hover:bg-white/10" data-testid="home-link">
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-white hover:bg-white/10"
              data-testid="logout-btn"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="border-l-4 border-[#1a365d]" data-testid="stat-total-players">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Players</p>
                  <p className="text-3xl font-bold text-[#1a365d]">{stats?.total_players || 0}</p>
                </div>
                <Users className="h-10 w-10 text-[#1a365d]/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-[#f7dc00]" data-testid="stat-total-teams">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Teams</p>
                  <p className="text-3xl font-bold text-[#1a365d]">{stats?.total_teams || 0}</p>
                </div>
                <Trophy className="h-10 w-10 text-[#f7dc00]/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-[#2d5a27]" data-testid="stat-paid-players">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Paid</p>
                  <p className="text-3xl font-bold text-[#2d5a27]">{stats?.paid_players || 0}</p>
                </div>
                <DollarSign className="h-10 w-10 text-[#2d5a27]/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-red-500" data-testid="stat-unpaid-players">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Unpaid</p>
                  <p className="text-3xl font-bold text-red-500">{stats?.unpaid_players || 0}</p>
                </div>
                <XCircle className="h-10 w-10 text-red-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <div className="flex gap-3">
            <Link to="/admin/checkin">
              <Button className="bg-[#1a365d] hover:bg-[#0f2342]" data-testid="goto-checkin-btn">
                <UserCheck className="h-4 w-4 mr-2" />
                Check-In
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="outline" className="border-[#1a365d] text-[#1a365d]" data-testid="goto-leaderboard-btn">
                <BarChart3 className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
            </Link>
            <Button variant="outline" onClick={printRoster} className="border-[#1a365d] text-[#1a365d]" data-testid="print-roster-btn">
              <Printer className="h-4 w-4 mr-2" />
              Print Roster
            </Button>
          </div>
          <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="border-[#2d5a27] text-[#2d5a27] hover:bg-[#2d5a27] hover:text-white"
                data-testid="export-btn"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("players")} data-testid="export-players-btn">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export All Players
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("teams")} data-testid="export-teams-btn">
                <Trophy className="h-4 w-4 mr-2" />
                Export Teams Summary
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="outline" 
            onClick={fetchData} 
            disabled={loading}
            className="border-[#1a365d] text-[#1a365d]"
            data-testid="refresh-btn"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="bg-white shadow">
            <TabsTrigger value="teams" className="data-[state=active]:bg-[#1a365d] data-[state=active]:text-white" data-testid="teams-tab">
              <Trophy className="h-4 w-4 mr-2" />
              Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="holes" className="data-[state=active]:bg-[#1a365d] data-[state=active]:text-white" data-testid="holes-tab">
              <Flag className="h-4 w-4 mr-2" />
              Hole Groupings
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-[#1a365d] data-[state=active]:text-white" data-testid="players-tab">
              <Users className="h-4 w-4 mr-2" />
              All Players ({players.length})
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-[#1a365d] data-[state=active]:text-white" data-testid="results-tab">
              <Target className="h-4 w-4 mr-2" />
              Results & Raffles
            </TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-slate-500">
                    No teams registered yet.
                  </CardContent>
                </Card>
              ) : (
                teams.map((team) => (
                  <Card key={team.id} className="shadow-lg hover:shadow-xl transition-shadow" data-testid={`team-card-${team.team_number}`}>
                    <CardHeader className="bg-[#1a365d] text-white py-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-heading text-xl flex items-center gap-2 flex-wrap">
                          <Trophy className="h-5 w-5 text-[#f7dc00]" />
                          Team {team.team_number}
                          {team.starting_hole && (
                            <span className="text-xs font-bold bg-[#f7dc00] text-[#1a365d] px-2 py-0.5 rounded-full uppercase tracking-wide" data-testid={`team-${team.team_number}-starting-hole`}>
                              Hole {team.starting_hole}{team.team_number > 18 ? " (2nd)" : ""}
                            </span>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={team.is_full ? "default" : "secondary"} className={team.is_full ? "bg-[#2d5a27]" : "bg-orange-500"}>
                            {team.is_full ? "Full" : `${team.spots_remaining} spots`}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markTeamPaid(team.id)}
                            className="text-[#f7dc00] hover:text-white hover:bg-white/10 h-8 px-2 text-xs"
                            data-testid={`mark-team-${team.team_number}-paid-btn`}
                          >
                            <DollarSign className="h-3 w-3 mr-1" />
                            All Paid
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ 
                              open: true, 
                              type: "team", 
                              id: team.id, 
                              name: `Team ${team.team_number}` 
                            })}
                            className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                            data-testid={`delete-team-${team.team_number}-btn`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      {/* Score Input */}
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                        <span className="text-xs font-bold uppercase text-slate-500">Score:</span>
                        <input
                          type="number"
                          defaultValue={team.score ?? ""}
                          placeholder="—"
                          onBlur={(e) => {
                            if (e.target.value && parseInt(e.target.value) !== team.score) {
                              updateTeamScore(team.id, e.target.value);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.target.blur();
                          }}
                          className="w-20 h-8 text-center text-lg font-bold text-[#1a365d] border border-slate-200 rounded bg-white focus:border-[#f7dc00] focus:ring-1 focus:ring-[#f7dc00] outline-none"
                          data-testid={`team-${team.team_number}-score-input`}
                        />
                      </div>
                      {team.players.length === 0 ? (
                        <p className="text-slate-400 text-sm italic">No players yet</p>
                      ) : (
                        <ul className="space-y-2">
                          {team.players.map((player, idx) => (
                            <li 
                              key={player.id} 
                              className="flex items-center justify-between p-2 bg-slate-50 rounded"
                              data-testid={`team-${team.team_number}-player-${idx}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-[#1a365d] text-white text-xs rounded-full flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="font-medium text-sm">
                                  {player.first_name} {player.last_name}
                                </span>
                                {player.is_captain && (
                                  <Crown className="h-4 w-4 text-[#f7dc00]" />
                                )}
                                <button 
                                  onClick={() => togglePayment(player.id, player.payment_status || "unpaid")}
                                  className={`text-xs px-2 py-0.5 rounded-full cursor-pointer font-semibold ${
                                    player.payment_status === "paid" 
                                      ? "bg-[#2d5a27] text-white" 
                                      : "bg-red-100 text-red-700"
                                  }`}
                                  data-testid={`toggle-payment-${player.id}`}
                                >
                                  {player.payment_status === "paid" ? "Paid" : "Unpaid"}
                                </button>
                                <button
                                  onClick={() => toggleCheckIn(player.id, player.checked_in)}
                                  className={`text-xs px-2 py-0.5 rounded-full cursor-pointer font-semibold ${
                                    player.checked_in
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-200 text-slate-500"
                                  }`}
                                  data-testid={`toggle-checkin-${player.id}`}
                                >
                                  {player.checked_in ? "Here" : "Not In"}
                                </button>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteDialog({ 
                                  open: true, 
                                  type: "player", 
                                  id: player.id, 
                                  name: `${player.first_name} ${player.last_name}` 
                                })}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                                data-testid={`delete-player-${player.id}-btn`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Hole Groupings Tab */}
          <TabsContent value="holes">
            <HoleGroupingsView teams={teams} onPrint={printHoleGroupings} />
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players">
            <Card className="shadow-lg">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-bold">#</TableHead>
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="font-bold">Phone</TableHead>
                      <TableHead className="font-bold">Association</TableHead>
                      <TableHead className="font-bold">Team</TableHead>
                      <TableHead className="font-bold">Role</TableHead>
                      <TableHead className="font-bold">Payment</TableHead>
                      <TableHead className="font-bold w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                          No players registered yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      players.map((player, idx) => (
                        <TableRow key={player.id} data-testid={`player-row-${player.id}`}>
                          <TableCell className="font-medium">{idx + 1}</TableCell>
                          <TableCell className="font-medium">
                            {player.first_name} {player.last_name}
                          </TableCell>
                          <TableCell className="text-sm">{player.email}</TableCell>
                          <TableCell className="text-sm">{player.phone}</TableCell>
                          <TableCell className="text-sm">{player.association}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-[#1a365d] text-[#1a365d]">
                              Team {player.team_number || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {player.is_captain && (
                              <Badge className="bg-[#f7dc00] text-[#1a365d]">
                                <Crown className="h-3 w-3 mr-1" />
                                Captain
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => togglePayment(player.id, player.payment_status || "unpaid")}
                              className={`text-xs px-3 py-1 rounded-full cursor-pointer font-semibold transition-colors ${
                                player.payment_status === "paid"
                                  ? "bg-[#2d5a27] text-white hover:bg-[#2d5a27]/80"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                              data-testid={`toggle-payment-table-${player.id}`}
                            >
                              {player.payment_status === "paid" ? "Paid" : "Unpaid"}
                            </button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteDialog({ 
                                open: true, 
                                type: "player", 
                                id: player.id, 
                                name: `${player.first_name} ${player.last_name}` 
                              })}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              data-testid={`delete-player-table-${player.id}-btn`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results & Raffles Tab */}
          <TabsContent value="results">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Competition Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1a365d] flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Competition Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add form */}
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex gap-2">
                      <select
                        value={newCompetition.competition_type}
                        onChange={(e) => setNewCompetition({...newCompetition, competition_type: e.target.value})}
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                        data-testid="competition-type-select"
                      >
                        <option value="long_drive">Long Drive</option>
                        <option value="closest_pin">Closest to Pin</option>
                      </select>
                      <Input
                        placeholder="Winner name"
                        value={newCompetition.winner_name}
                        onChange={(e) => setNewCompetition({...newCompetition, winner_name: e.target.value})}
                        className="flex-1"
                        data-testid="competition-winner-input"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Details (e.g. 285 yards, 3ft 2in)"
                        value={newCompetition.details}
                        onChange={(e) => setNewCompetition({...newCompetition, details: e.target.value})}
                        className="flex-1"
                        data-testid="competition-details-input"
                      />
                      <Button onClick={addCompetition} className="bg-[#1a365d] hover:bg-[#0f2342]" data-testid="add-competition-btn">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>

                  {/* Results list */}
                  {competitions.length === 0 ? (
                    <p className="text-center text-slate-400 py-4">No competition results yet</p>
                  ) : (
                    <div className="space-y-2">
                      {competitions.map(comp => (
                        <div key={comp.id} className="flex items-center justify-between bg-white border rounded-lg px-4 py-3" data-testid={`competition-${comp.id}`}>
                          <div className="flex items-center gap-3">
                            {comp.competition_type === "long_drive" ? (
                              <Zap className="h-5 w-5 text-[#f7dc00]" />
                            ) : (
                              <Target className="h-5 w-5 text-[#f7dc00]" />
                            )}
                            <div>
                              <p className="font-semibold text-[#1a365d]">{comp.winner_name}</p>
                              <p className="text-xs text-slate-500">
                                {comp.competition_type === "long_drive" ? "Long Drive" : "Closest to Pin"}
                                {comp.details && ` — ${comp.details}`}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => deleteCompetition(comp.id)} className="text-red-500 hover:text-red-700 h-8 w-8 p-0" data-testid={`delete-competition-${comp.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Raffle Winners */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#1a365d] flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Raffle Winners
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add form */}
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Winner name"
                        value={newRaffle.winner_name}
                        onChange={(e) => setNewRaffle({...newRaffle, winner_name: e.target.value})}
                        className="flex-1"
                        data-testid="raffle-winner-input"
                      />
                      <Input
                        placeholder="Prize description"
                        value={newRaffle.prize}
                        onChange={(e) => setNewRaffle({...newRaffle, prize: e.target.value})}
                        className="flex-1"
                        data-testid="raffle-prize-input"
                      />
                      <Button onClick={addRaffle} className="bg-[#f7dc00] text-[#1a365d] hover:bg-[#d4b800]" data-testid="add-raffle-btn">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>

                  {/* Winners list */}
                  {raffles.length === 0 ? (
                    <p className="text-center text-slate-400 py-4">No raffle winners yet</p>
                  ) : (
                    <div className="space-y-2">
                      {raffles.map(raffle => (
                        <div key={raffle.id} className="flex items-center justify-between bg-white border rounded-lg px-4 py-3" data-testid={`raffle-${raffle.id}`}>
                          <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-[#f7dc00]" />
                            <div>
                              <p className="font-semibold text-[#1a365d]">{raffle.winner_name}</p>
                              <p className="text-xs text-slate-500">{raffle.prize}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => deleteRaffle(raffle.id)} className="text-red-500 hover:text-red-700 h-8 w-8 p-0" data-testid={`delete-raffle-${raffle.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !open && setDeleteDialog({ ...deleteDialog, open: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.name}</strong>?
              {deleteDialog.type === "team" && (
                <span className="block mt-2 text-red-500">
                  This will also delete all players in this team.
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="cancel-delete-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              data-testid="confirm-delete-btn"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
