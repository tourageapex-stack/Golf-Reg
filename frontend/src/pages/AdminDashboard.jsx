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
  RefreshCw, CheckCircle, AlertCircle, Download, FileSpreadsheet
} from "lucide-react";
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, id: null, name: "" });

  const getAuthHeader = useCallback(() => {
    const auth = sessionStorage.getItem("adminAuth");
    if (!auth) {
      navigate("/admin");
      return null;
    }
    return { Authorization: `Basic ${auth}` };
  }, [navigate]);

  const fetchData = useCallback(async () => {
    const headers = getAuthHeader();
    if (!headers) return;

    setLoading(true);
    try {
      const [statsRes, teamsRes, playersRes] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, { headers }),
        axios.get(`${API}/admin/teams`, { headers }),
        axios.get(`${API}/admin/players`, { headers })
      ]);
      
      setStats(statsRes.data);
      setTeams(teamsRes.data);
      setPlayers(playersRes.data);
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
        headers: { Authorization: `Basic ${auth}` }
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

          <Card className="border-l-4 border-[#2d5a27]" data-testid="stat-full-teams">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Full Teams</p>
                  <p className="text-3xl font-bold text-[#1a365d]">{stats?.teams_full || 0}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-[#2d5a27]/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-orange-500" data-testid="stat-spots-remaining">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Spots Left</p>
                  <p className="text-3xl font-bold text-[#1a365d]">{stats?.spots_remaining || 0}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-orange-500/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mb-4">
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

        {/* Tabs */}
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="bg-white shadow">
            <TabsTrigger value="teams" className="data-[state=active]:bg-[#1a365d] data-[state=active]:text-white" data-testid="teams-tab">
              <Trophy className="h-4 w-4 mr-2" />
              Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-[#1a365d] data-[state=active]:text-white" data-testid="players-tab">
              <Users className="h-4 w-4 mr-2" />
              All Players ({players.length})
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
                        <CardTitle className="font-heading text-xl flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-[#f7dc00]" />
                          Team {team.team_number}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={team.is_full ? "default" : "secondary"} className={team.is_full ? "bg-[#2d5a27]" : "bg-orange-500"}>
                            {team.is_full ? "Full" : `${team.spots_remaining} spots`}
                          </Badge>
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
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-500">
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
