import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, AlertCircle, DollarSign, Clock, Users, CreditCard, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';
const LOGO_URL = "/images/ilwu_logo.png";

export default function IndividualRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tournamentInfo, setTournamentInfo] = useState(null);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [joinExisting, setJoinExisting] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    association: "",
    customAssociation: ""
  });

  useEffect(() => {
    axios.get(`${API}/tournament-info`).then(res => setTournamentInfo(res.data)).catch(() => {});
    axios.get(`${API}/teams/available`).then(res => setAvailableTeams(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssociationChange = (value) => {
    setFormData(prev => ({ ...prev, association: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.email || !formData.association) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.association === "other" && !formData.customAssociation) {
      toast.error("Please enter your association");
      return;
    }

    if (joinExisting && !selectedTeamId) {
      toast.error("Please select a team captain to join");
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email,
        association: formData.association === "other" ? formData.customAssociation : formData.association,
        ...(joinExisting && selectedTeamId ? { team_id: selectedTeamId } : {})
      };

      const response = await axios.post(`${API}/register/individual`, submitData);
      
      // Navigate to confirmation page with registration data
      navigate("/confirmation", { 
        state: { 
          registration: response.data,
          type: "individual",
          playerName: `${formData.first_name} ${formData.last_name}`
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
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Form Section */}
          <div>
            <Card className="shadow-xl border-0" data-testid="registration-form-card">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-[#1a365d] rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-2xl font-bold text-[#1a365d] uppercase">
                      Individual Registration
                    </CardTitle>
                    <CardDescription>
                      Register as a single player - we'll assign you to a team
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-sm font-bold uppercase tracking-wider text-slate-600">
                        First Name *
                      </Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="h-12 bg-slate-50 border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                        placeholder="John"
                        data-testid="first-name-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-sm font-bold uppercase tracking-wider text-slate-600">
                        Last Name *
                      </Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="h-12 bg-slate-50 border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                        placeholder="Doe"
                        data-testid="last-name-input"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-wider text-slate-600">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="h-12 bg-slate-50 border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                      placeholder="(555) 123-4567"
                      data-testid="phone-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-slate-600">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-12 bg-slate-50 border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                      placeholder="john.doe@email.com"
                      data-testid="email-input"
                      required
                    />
                  </div>

                  {/* Association */}
                  <div className="space-y-2">
                    <Label htmlFor="association" className="text-sm font-bold uppercase tracking-wider text-slate-600">
                      Association *
                    </Label>
                    <Select onValueChange={handleAssociationChange} value={formData.association}>
                      <SelectTrigger className="h-12 bg-slate-50 border-slate-200" data-testid="association-select">
                        <SelectValue placeholder="Select your association" />
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

                  {formData.association === "other" && (
                    <div className="space-y-2">
                      <Label htmlFor="customAssociation" className="text-sm font-bold uppercase tracking-wider text-slate-600">
                        Specify Your Local *
                      </Label>
                      <Input
                        id="customAssociation"
                        name="customAssociation"
                        value={formData.customAssociation}
                        onChange={handleChange}
                        className="h-12 bg-slate-50 border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                        placeholder="Enter your local number"
                        data-testid="custom-association-input"
                      />
                    </div>
                  )}

                  {/* Join Existing Team Option */}
                  {availableTeams.length > 0 && (
                    <div className="space-y-4 border-t border-slate-200 pt-6">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="joinExisting"
                          checked={joinExisting}
                          onChange={(e) => {
                            setJoinExisting(e.target.checked);
                            if (!e.target.checked) setSelectedTeamId("");
                          }}
                          className="w-5 h-5 rounded border-slate-300 text-[#1a365d] focus:ring-[#1a365d] cursor-pointer"
                          data-testid="join-existing-team-checkbox"
                        />
                        <Label htmlFor="joinExisting" className="text-sm font-bold uppercase tracking-wider text-slate-600 cursor-pointer">
                          I have a team already — join an existing team
                        </Label>
                      </div>

                      {joinExisting && (
                        <div className="space-y-2">
                          <Label className="text-sm font-bold uppercase tracking-wider text-slate-600">
                            Select Your Team Captain *
                          </Label>
                          <Select onValueChange={(value) => setSelectedTeamId(value)} value={selectedTeamId}>
                            <SelectTrigger className="h-12 bg-slate-50 border-slate-200" data-testid="team-captain-select">
                              <SelectValue placeholder="Choose your team captain" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTeams.map((team) => (
                                <SelectItem key={team.team_id} value={team.team_id}>
                                  <span className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-[#1a365d] inline" />
                                    Team {team.team_number} — Captain: {team.captain_name} ({team.spots_remaining} spot{team.spots_remaining > 1 ? 's' : ''} left)
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1a365d] text-white hover:bg-[#1a365d]/90 font-bold uppercase tracking-wide py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid="submit-registration-btn"
                  >
                    {loading ? "Registering..." : "Complete Registration"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="lg:sticky lg:top-8 space-y-6">
            {/* Price Info */}
            <Card className="bg-[#1a365d] text-white border-0 shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#f7dc00]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-8 relative">
                <DollarSign className="h-12 w-12 text-[#f7dc00] mb-4" />
                <h3 className="font-heading text-2xl font-bold uppercase mb-2">Registration Fee</h3>
                <p className="text-4xl font-bold text-[#f7dc00] mb-2">${tournamentInfo?.price_per_player || 150}</p>
                <p className="text-white/80">Per individual player</p>
                {tournamentInfo?.is_early_bird && (
                  <div className="mt-3 flex items-center gap-2 bg-[#f7dc00]/20 rounded-lg px-3 py-2">
                    <Clock className="h-4 w-4 text-[#f7dc00]" />
                    <span className="text-sm text-[#f7dc00] font-semibold">Early bird rate! $150 starting June 20th</span>
                  </div>
                )}
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

            {/* Credit Union Note */}
            <Card className="border-2 border-[#1a365d] bg-[#1a365d] text-white shadow-lg" data-testid="credit-union-note">
              <CardContent className="p-5 flex items-start gap-3">
                <CreditCard className="h-6 w-6 text-[#f7dc00] shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-[#f7dc00] uppercase tracking-wide text-xs mb-1">Important — Credit Union Payments</p>
                  <p>Please ask the Credit Union to add a note with <strong>your name</strong> on the payment so we can match it to your registration.</p>
                </div>
              </CardContent>
            </Card>

            {/* Online Payment Now Available */}
            <Card className="relative overflow-hidden border-2 border-[#f7dc00] bg-gradient-to-br from-[#0f2342] to-[#1a365d] shadow-xl" data-testid="pay-online-card">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-[#f7dc00]/10 rounded-full blur-2xl" />
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 bg-[#f7dc00] rounded-xl flex items-center justify-center shrink-0 rotate-3">
                    <Sparkles className="h-6 w-6 text-[#1a365d]" />
                  </div>
                  <div>
                    <span className="inline-block bg-[#f7dc00] text-[#1a365d] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1">
                      Now Available
                    </span>
                    <h4 className="font-heading text-lg font-bold text-white uppercase leading-tight">Pay Online Instantly</h4>
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Skip the trip — pay your entry fee securely online in seconds.
                </p>
                <Button
                  onClick={() => navigate("/pay")}
                  className="w-full bg-[#f7dc00] text-[#1a365d] hover:bg-[#ffe55c] font-bold uppercase tracking-wide"
                  data-testid="pay-online-btn"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Online Now
                </Button>
              </CardContent>
            </Card>

            {/* Team Assignment Info */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h4 className="font-heading text-lg font-bold text-[#1a365d] uppercase mb-3">How It Works</h4>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-[#1a365d] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</span>
                    <span>Complete your registration form</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-[#1a365d] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</span>
                    <span>You'll be assigned to a team automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-[#1a365d] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">3</span>
                    <span>First player on each team becomes captain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-[#1a365d] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">4</span>
                    <span>Arrange payment at Credit Union or Hall</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Golf Course Image */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.pexels.com/photos/15376160/pexels-photo-15376160.jpeg" 
                alt="Golf course" 
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
