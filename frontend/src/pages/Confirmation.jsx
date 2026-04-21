import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Trophy, Users, MapPin, DollarSign, ArrowLeft, Home, Calendar, CreditCard, Sparkles } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';
const LOGO_URL = "/images/ilwu_logo.png";

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { registration, type, playerName, playerCount, captainName } = location.state || {};
  const [tournamentInfo, setTournamentInfo] = useState(null);

  useEffect(() => {
    // Redirect if no registration data
    if (!registration) {
      navigate("/");
    }
    axios.get(`${API}/tournament-info`).then(res => setTournamentInfo(res.data)).catch(() => {});
  }, [registration, navigate]);

  if (!registration) {
    return null;
  }

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
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <Card className="shadow-2xl border-0 overflow-hidden" data-testid="confirmation-card">
            {/* Success Header */}
            <div className="bg-gradient-to-br from-[#2d5a27] to-[#1a4d1a] p-8 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="h-12 w-12 text-[#2d5a27]" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase mb-2" data-testid="confirmation-title">
                Registration Successful!
              </h1>
              <p className="text-white/90">
                {type === "individual" 
                  ? "You have been registered for the tournament"
                  : "Your team has been registered for the tournament"
                }
              </p>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Team Number */}
              <div className="text-center py-6 bg-[#1a365d] rounded-xl">
                <p className="text-white/70 text-sm uppercase tracking-wider mb-2">Your Team Number</p>
                <div className="flex items-center justify-center gap-3">
                  <Trophy className="h-10 w-10 text-[#f7dc00]" />
                  <span className="font-heading text-6xl font-bold text-[#f7dc00]" data-testid="team-number">
                    {registration.team_number}
                  </span>
                </div>
              </div>

              {/* Registration Details */}
              <div className="space-y-4">
                <h3 className="font-heading text-lg font-bold text-[#1a365d] uppercase">Registration Details</h3>
                
                <div className="grid gap-3">
                  {type === "individual" ? (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <Users className="h-5 w-5 text-[#1a365d]" />
                      <div>
                        <p className="text-sm text-slate-500">Player Name</p>
                        <p className="font-semibold text-[#1a365d]" data-testid="player-name">{playerName}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <Users className="h-5 w-5 text-[#1a365d]" />
                      <div>
                        <p className="text-sm text-slate-500">Team Size</p>
                        <p className="font-semibold text-[#1a365d]" data-testid="team-size">
                          {playerCount} Player{playerCount > 1 ? 's' : ''} 
                          {captainName && <span className="text-slate-500"> (Captain: {captainName})</span>}
                        </p>
                      </div>
                    </div>
                  )}

                  {registration.is_captain && type === "individual" && (
                    <div className="flex items-center gap-3 p-4 bg-[#f7dc00]/20 rounded-lg border border-[#f7dc00]">
                      <Trophy className="h-5 w-5 text-[#1a365d]" />
                      <div>
                        <p className="text-sm text-[#1a365d]/70">Status</p>
                        <p className="font-bold text-[#1a365d]" data-testid="captain-status">You are the Team Captain!</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-[#1a365d]" />
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-semibold text-[#1a365d]">Club Green Meadows</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-[#1a365d]" />
                    <div>
                      <p className="text-sm text-slate-500">Event Date</p>
                      <p className="font-semibold text-[#1a365d]">September 3, 2026</p>
                      <p className="text-sm text-slate-600 mt-1">Registration opens 7:00 AM · Shotgun tee off 8:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Notice */}
              <div className="bg-[#f7dc00] p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <DollarSign className="h-8 w-8 text-[#1a365d] shrink-0" />
                  <div>
                    <h4 className="font-heading text-lg font-bold text-[#1a365d] uppercase mb-2">
                      Payment Required
                    </h4>
                    <p className="text-[#1a365d]">
                      Please complete your payment at the <strong>Local 4 Credit Union</strong> or at <strong>the Hall</strong>.
                    </p>
                    <p className="text-[#1a365d] mt-2 font-semibold">
                      Amount Due: ${type === "individual" 
                        ? (tournamentInfo?.price_per_player || 150) 
                        : (playerCount * (tournamentInfo?.price_per_player || 150))}
                      {tournamentInfo?.is_early_bird && <span className="text-sm font-normal ml-1">(Early Bird Rate)</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Credit Union Note */}
              <div className="bg-[#1a365d] text-white p-5 rounded-xl shadow-lg" data-testid="credit-union-note">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-6 w-6 text-[#f7dc00] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[#f7dc00] uppercase tracking-wide text-xs mb-1">Important — Credit Union Payments</p>
                    <p className="text-sm">
                      When paying at the Credit Union, please ask them to add a note identifying <strong>who the payment is for</strong> so we can match it to your registration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Online Payment Coming Soon */}
              <div className="relative overflow-hidden rounded-xl border-2 border-[#f7dc00] bg-gradient-to-br from-[#0f2342] to-[#1a365d] shadow-xl" data-testid="online-payment-coming-soon">
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-[#f7dc00]/10 rounded-full blur-2xl" />
                <div className="relative p-6 flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#f7dc00] rounded-xl flex items-center justify-center shrink-0 rotate-3">
                    <Sparkles className="h-6 w-6 text-[#1a365d]" />
                  </div>
                  <div className="flex-1">
                    <span className="inline-block bg-[#f7dc00] text-[#1a365d] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-2">
                      Coming Soon
                    </span>
                    <h4 className="font-heading text-lg font-bold text-white uppercase leading-tight mb-1">Online Payment Methods</h4>
                    <p className="text-white/80 text-sm">
                      We're adding secure online payments soon so you can pay instantly — stay tuned!
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-[#1a365d] text-white hover:bg-[#1a365d]/90 font-bold uppercase tracking-wide py-6"
                  data-testid="return-home-btn"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center text-slate-500 text-sm">
            <p>Questions? Contact ILWU Local 4 at the Hall.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
