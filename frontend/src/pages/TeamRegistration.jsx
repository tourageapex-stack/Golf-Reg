import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, AlertCircle, DollarSign, Plus, Trash2, Crown, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_greenmeadows-golf/artifacts/n4xo0dyh_IMG_1411.png";

const emptyPlayer = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  association: "",
  customAssociation: ""
};

export default function TeamRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tournamentInfo, setTournamentInfo] = useState(null);
  const [players, setPlayers] = useState([{ ...emptyPlayer }]);

  useEffect(() => {
    axios.get(`${API}/tournament-info`).then(res => setTournamentInfo(res.data)).catch(() => {});
  }, []);

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, { ...emptyPlayer }]);
    }
  };

  const removePlayer = (index) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const handlePlayerChange = (index, field, value) => {
    const updated = [...players];
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);
  };

  const validateForm = () => {
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p.first_name || !p.last_name || !p.phone || !p.email || !p.association) {
        toast.error(`Please fill in all required fields for Player ${i + 1}`);
        return false;
      }
      if (p.association === "other" && !p.customAssociation) {
        toast.error(`Please specify the association for Player ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const submitData = {
        players: players.map(p => ({
          first_name: p.first_name,
          last_name: p.last_name,
          phone: p.phone,
          email: p.email,
          association: p.association === "other" ? p.customAssociation : p.association
        }))
      };

      const response = await axios.post(`${API}/register/team`, submitData);
      
      navigate("/confirmation", { 
        state: { 
          registration: response.data,
          type: "team",
          playerCount: players.length,
          captainName: `${players[0].first_name} ${players[0].last_name}`
        } 
      });
    } catch (error) {
      console.error("Registration error:", error);
      const message = error.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const pricePerPlayer = tournamentInfo?.price_per_player || 150;
  const totalPrice = players.length === 4 ? pricePerPlayer * 4 : players.length * pricePerPlayer;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#1a365d] py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <img src={LOGO_URL} alt="ILWU Logo" className="w-10 h-10 rounded-full border-2 border-[#f7dc00]" />
            <span className="font-heading text-xl font-bold uppercase">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0" data-testid="team-registration-form-card">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-[#1a365d] rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-2xl font-bold text-[#1a365d] uppercase">
                      Team Registration
                    </CardTitle>
                    <CardDescription>
                      Register a team of 1-4 players. First player will be team captain.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {players.map((player, index) => (
                    <div key={index} className="relative">
                      {/* Player Card */}
                      <Card className={`border ${index === 0 ? 'border-[#f7dc00] bg-[#f7dc00]/5' : 'border-slate-200'}`}>
                        <CardContent className="p-6">
                          {/* Player Header */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 bg-[#1a365d] text-white rounded-full flex items-center justify-center font-bold">
                                {index + 1}
                              </span>
                              <span className="font-heading text-lg font-bold text-[#1a365d] uppercase">
                                Player {index + 1}
                              </span>
                              {index === 0 && (
                                <Badge className="bg-[#f7dc00] text-[#1a365d] hover:bg-[#f7dc00]">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Captain
                                </Badge>
                              )}
                            </div>
                            {index > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePlayer(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                data-testid={`remove-player-${index}-btn`}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>

                          {/* Player Fields */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-bold uppercase tracking-wider text-slate-600">
                                First Name *
                              </Label>
                              <Input
                                value={player.first_name}
                                onChange={(e) => handlePlayerChange(index, "first_name", e.target.value)}
                                className="h-12 bg-white border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                                placeholder="John"
                                data-testid={`player-${index}-first-name`}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-bold uppercase tracking-wider text-slate-600">
                                Last Name *
                              </Label>
                              <Input
                                value={player.last_name}
                                onChange={(e) => handlePlayerChange(index, "last_name", e.target.value)}
                                className="h-12 bg-white border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                                placeholder="Doe"
                                data-testid={`player-${index}-last-name`}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-bold uppercase tracking-wider text-slate-600">
                                Phone *
                              </Label>
                              <Input
                                type="tel"
                                value={player.phone}
                                onChange={(e) => handlePlayerChange(index, "phone", e.target.value)}
                                className="h-12 bg-white border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                                placeholder="(555) 123-4567"
                                data-testid={`player-${index}-phone`}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-bold uppercase tracking-wider text-slate-600">
                                Email *
                              </Label>
                              <Input
                                type="email"
                                value={player.email}
                                onChange={(e) => handlePlayerChange(index, "email", e.target.value)}
                                className="h-12 bg-white border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                                placeholder="john@email.com"
                                data-testid={`player-${index}-email`}
                                required
                              />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <Label className="text-sm font-bold uppercase tracking-wider text-slate-600">
                                Association *
                              </Label>
                              <Select 
                                onValueChange={(value) => handlePlayerChange(index, "association", value)} 
                                value={player.association}
                              >
                                <SelectTrigger className="h-12 bg-white border-slate-200" data-testid={`player-${index}-association`}>
                                  <SelectValue placeholder="Select association" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Local 4">Local 4 Member</SelectItem>
                                  <SelectItem value="Local 8">Local 8 Member</SelectItem>
                                  <SelectItem value="Local 19">Local 19 Member</SelectItem>
                                  <SelectItem value="Local 23">Local 23 Member</SelectItem>
                                  <SelectItem value="Local 40">Local 40 Member</SelectItem>
                                  <SelectItem value="friend">Friend of Local Member</SelectItem>
                                  <SelectItem value="other">Other Local (specify)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {player.association === "other" && (
                              <div className="space-y-2 sm:col-span-2">
                                <Label className="text-sm font-bold uppercase tracking-wider text-slate-600">
                                  Specify Your Local *
                                </Label>
                                <Input
                                  value={player.customAssociation}
                                  onChange={(e) => handlePlayerChange(index, "customAssociation", e.target.value)}
                                  className="h-12 bg-white border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                                  placeholder="Enter your local number"
                                  data-testid={`player-${index}-custom-association`}
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}

                  {/* Add Player Button */}
                  {players.length < 4 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addPlayer}
                      className="w-full border-2 border-dashed border-[#1a365d]/30 text-[#1a365d] hover:bg-[#1a365d]/5 py-6"
                      data-testid="add-player-btn"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Player ({players.length}/4)
                    </Button>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1a365d] text-white hover:bg-[#1a365d]/90 font-bold uppercase tracking-wide py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid="submit-team-registration-btn"
                  >
                    {loading ? "Registering Team..." : "Complete Team Registration"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6 lg:sticky lg:top-8 self-start">
            {/* Price Summary */}
            <Card className="bg-[#1a365d] text-white border-0 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f7dc00]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-8 relative">
                <DollarSign className="h-12 w-12 text-[#f7dc00] mb-4" />
                <h3 className="font-heading text-2xl font-bold uppercase mb-2">Total Cost</h3>
                <p className="text-4xl font-bold text-[#f7dc00] mb-2">${totalPrice}</p>
                <p className="text-white/80 text-sm">
                  {players.length} player{players.length > 1 ? 's' : ''} x ${pricePerPlayer}/player
                </p>
                {players.length < 4 && (
                  <p className="text-white/60 text-sm mt-1">
                    Full team of 4: ${pricePerPlayer * 4}
                  </p>
                )}
                {tournamentInfo?.is_early_bird && (
                  <div className="mt-3 bg-[#f7dc00]/20 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#f7dc00]" />
                      <span className="text-sm text-[#f7dc00] font-semibold">Early bird rate!</span>
                    </div>
                    <p className="text-xs text-white/70 mt-1">$150/player (team of 4: $600) starting June 20th</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Captain Payment Notice */}
            <Card className="border-2 border-[#f7dc00] bg-[#f7dc00]/10 shadow-lg" data-testid="captain-payment-notice">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-[#f7dc00] rounded-full flex items-center justify-center shrink-0">
                  <Crown className="h-5 w-5 text-[#1a365d]" />
                </div>
                <div>
                  <h4 className="font-heading text-base font-bold text-[#1a365d] uppercase mb-1">Team Captain Pays in Full</h4>
                  <p className="text-slate-700 text-sm">The team captain is responsible for paying the full team registration cost.</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Notice */}
            <Alert className="bg-[#f7dc00] border-[#f7dc00]">
              <AlertCircle className="h-5 w-5 text-[#1a365d]" />
              <AlertDescription className="text-[#1a365d] font-medium">
                <strong>Payment Instructions:</strong> After completing registration, please arrange payment at the 
                <strong> Local 4 Credit Union</strong> or at <strong>the Hall</strong>.
              </AlertDescription>
            </Alert>

            {/* Team Info */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-heading text-lg font-bold text-[#1a365d] uppercase mb-3">Team Registration Info</h4>
                <ul className="space-y-3 text-slate-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#f7dc00]">•</span>
                    <span>Teams can have 1-4 players</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f7dc00]">•</span>
                    <span>First player listed becomes team captain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f7dc00]">•</span>
                    <span>Your team will be assigned a random number (1-18)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#f7dc00]">•</span>
                    <span>Full team of 4 = ${pricePerPlayer * 4} total</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
