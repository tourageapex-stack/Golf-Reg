import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, DollarSign, Users, Trophy, Shield, Target, Star, Award, Zap, Gift, Clock, CreditCard, Sparkles, CalendarPlus, Share2 } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';

const LOGO_URL = "/images/ilwu_logo.png";
const HERO_BG = "https://images.pexels.com/photos/5384079/pexels-photo-5384079.jpeg";

export default function LandingPage() {
  const navigate = useNavigate();
  const [tournamentInfo, setTournamentInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await axios.get(`${API}/tournament-info`);
        setTournamentInfo(response.data);
      } catch (error) {
        console.error("Error fetching tournament info:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const spotsRemaining = tournamentInfo 
    ? (18 - tournamentInfo.current_teams) * 4 + (tournamentInfo.current_teams * 4 - tournamentInfo.current_players)
    : 72;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d]/95 to-[#0f2342]/90" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-12 text-center">
          {/* Logo */}
          <div className="mb-8 animate-fade-in-up">
            <img 
              src={LOGO_URL} 
              alt="ILWU Logo" 
              className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full shadow-2xl border-4 border-[#f7dc00]"
              data-testid="ilwu-logo"
            />
          </div>
          
          {/* Title */}
          <h1 
            className="font-heading text-5xl md:text-7xl font-bold text-white uppercase tracking-tight mb-4 animate-fade-in-up animation-delay-100"
            data-testid="hero-title"
          >
            ILWU Local 4
          </h1>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-[#f7dc00] uppercase tracking-tight mb-8 animate-fade-in-up animation-delay-200">
            Golf Tournament
          </h2>
          
          {/* Tagline */}
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12 animate-fade-in-up animation-delay-300">
            Join your union brothers and sisters for a day of golf, camaraderie, and friendly competition at Club Green Meadows.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Button
              onClick={() => navigate("/register/individual")}
              className="bg-[#f7dc00] text-[#1a365d] hover:bg-[#ffe55c] font-bold uppercase tracking-wide py-6 px-8 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
              data-testid="register-individual-btn"
            >
              <Users className="mr-2 h-5 w-5" />
              Register Individual
            </Button>
            <Button
              onClick={() => navigate("/register/team")}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-[#1a365d] font-bold uppercase tracking-wide py-6 px-8 text-lg transition-all duration-300"
              data-testid="register-team-btn"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Register Team
            </Button>
            <Button
              onClick={() => navigate("/leaderboard")}
              variant="outline"
              className="border-2 border-[#f7dc00] text-[#f7dc00] hover:bg-[#f7dc00] hover:text-[#1a365d] font-bold uppercase tracking-wide py-6 px-8 text-lg transition-all duration-300"
              data-testid="leaderboard-btn"
            >
              <Award className="mr-2 h-5 w-5" />
              Leaderboard
            </Button>
            <Button
              onClick={() => navigate("/flyer")}
              variant="outline"
              className="border-2 border-white/60 text-white hover:bg-white/10 font-bold uppercase tracking-wide py-6 px-8 text-lg transition-all duration-300"
              data-testid="share-event-btn"
            >
              <Share2 className="mr-2 h-5 w-5" />
              Share Event
            </Button>
          </div>
          
          {/* Spots Remaining Badge */}
          {!loading && (
            <div className="mt-8 animate-fade-in-up animation-delay-400">
              <span className="inline-block bg-white/10 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-semibold border border-white/20">
                {spotsRemaining > 0 ? `${spotsRemaining} spots remaining` : "Registration Full"}
              </span>
            </div>
          )}
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Info Bento Grid */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-[#1a365d] uppercase text-center mb-12" data-testid="event-details-heading">
            Event Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Date Card */}
            <Card className="p-8 bg-white border-l-4 border-[#f7dc00] shadow-sm hover:shadow-md transition-all duration-300" data-testid="date-card">
              <Calendar className="h-10 w-10 text-[#1a365d] mb-4" />
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Date & Schedule</p>
              <p className="font-heading text-2xl font-bold text-[#1a365d]">September 3, 2026</p>
              <p className="text-slate-600 mt-2">Registration opens at 7:00 AM</p>
              <p className="text-slate-600">Shotgun tee off at 8:00 AM</p>
              <a
                href={`${API}/calendar.ics`}
                download="ilwu-golf-tournament.ics"
                className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold uppercase tracking-wider text-[#1a365d] hover:text-[#0f2342] border-b-2 border-[#f7dc00] pb-0.5 transition-colors"
                data-testid="add-to-calendar-link"
              >
                <CalendarPlus className="h-4 w-4" />
                Add to Calendar
              </a>
            </Card>
            
            {/* Location Card */}
            <Card className="p-8 bg-white border-l-4 border-[#f7dc00] shadow-sm hover:shadow-md transition-all duration-300" data-testid="location-card">
              <MapPin className="h-10 w-10 text-[#1a365d] mb-4" />
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Location</p>
              <p className="font-heading text-2xl font-bold text-[#1a365d]">Club Green Meadows</p>
              <p className="text-slate-600 mt-2">18-hole championship course</p>
            </Card>
            
            {/* Price Card */}
            <Card className="p-8 bg-white border-l-4 border-[#f7dc00] shadow-sm hover:shadow-md transition-all duration-300" data-testid="price-card">
              <DollarSign className="h-10 w-10 text-[#1a365d] mb-4" />
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Price</p>
              <p className="font-heading text-2xl font-bold text-[#1a365d]">
                {tournamentInfo?.is_early_bird ? "$125" : "$150"} / Player
              </p>
              <p className="text-slate-600 mt-2">
                {tournamentInfo?.is_early_bird 
                  ? "Early bird rate! $150 starting June 20th" 
                  : "$600 per team of 4"}
              </p>
            </Card>
            
            {/* Format Card */}
            <Card className="p-8 bg-white border-l-4 border-[#f7dc00] shadow-sm hover:shadow-md transition-all duration-300" data-testid="format-card">
              <Users className="h-10 w-10 text-[#1a365d] mb-4" />
              <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Format</p>
              <p className="font-heading text-2xl font-bold text-[#1a365d]">Best Ball Scramble Shotgun start 4-Person Teams</p>
              <p className="text-slate-600 mt-2">Max 18 teams · Lunch included</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Early Bird Pricing Banner */}
      <section className="py-10 bg-[#1a365d]" data-testid="early-bird-section">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-[#0f2342] to-[#1a365d] border-2 border-[#f7dc00] rounded-2xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#f7dc00] rounded-full flex items-center justify-center shrink-0">
                  <Clock className="h-8 w-8 text-[#1a365d]" />
                </div>
                <div>
                  <h3 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase">Early Bird Special</h3>
                  <p className="text-white/80 mt-1">Register before June 20th and save!</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="flex items-baseline gap-3 justify-center md:justify-end">
                  <span className="text-5xl font-bold text-[#f7dc00]">$125</span>
                  <span className="text-white/50 line-through text-2xl">$150</span>
                </div>
                <p className="text-white/70 text-sm mt-1">per player before June 20th</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extras & Prizes Section */}
      <section className="py-16 md:py-24 bg-white" data-testid="extras-prizes-section">
        <div className="container mx-auto px-6">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-[#1a365d] uppercase text-center mb-4" data-testid="extras-prizes-heading">
            Extras & Prizes
          </h2>
          <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12 text-lg">
            Compete for prizes and purchase extras to improve your game day experience
          </p>

          {/* Competitions / Extras to Purchase */}
          <div className="mb-16">
            <h3 className="font-heading text-xl md:text-2xl font-bold text-[#1a365d] uppercase text-center mb-8">
              Available Add-Ons
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Long Drive */}
              <Card className="p-6 bg-slate-50 border-0 shadow-md hover:shadow-lg transition-all duration-300 text-center" data-testid="long-drive-card">
                <div className="w-14 h-14 bg-[#1a365d] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-7 w-7 text-[#f7dc00]" />
                </div>
                <h4 className="font-heading text-lg font-bold text-[#1a365d] uppercase mb-2">Long Drive Competition</h4>
                <p className="text-slate-600 text-sm">Test your power off the tee and compete for the longest drive</p>
              </Card>

              {/* Closest to Pin */}
              <Card className="p-6 bg-slate-50 border-0 shadow-md hover:shadow-lg transition-all duration-300 text-center" data-testid="closest-pin-card">
                <div className="w-14 h-14 bg-[#1a365d] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-7 w-7 text-[#f7dc00]" />
                </div>
                <h4 className="font-heading text-lg font-bold text-[#1a365d] uppercase mb-2">Closest to the Pin</h4>
                <p className="text-slate-600 text-sm">Precision counts! Get your ball closest to the pin to win</p>
              </Card>

              {/* Mulligans */}
              <Card className="p-6 bg-slate-50 border-0 shadow-md hover:shadow-lg transition-all duration-300 text-center" data-testid="mulligans-card">
                <div className="w-14 h-14 bg-[#1a365d] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-7 w-7 text-[#f7dc00]" />
                </div>
                <h4 className="font-heading text-lg font-bold text-[#1a365d] uppercase mb-2">Mulligans</h4>
                <p className="text-slate-600 text-sm">Purchase mulligans for a second chance on your shot</p>
              </Card>
            </div>
          </div>

          {/* Team Prizes */}
          <div>
            <h3 className="font-heading text-xl md:text-2xl font-bold text-[#1a365d] uppercase text-center mb-8">
              Team Prizes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {/* 1st Place */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300" data-testid="prize-1st-card">
                <div className="bg-gradient-to-br from-[#f7dc00] to-[#d4b800] p-6 text-center">
                  <Trophy className="h-12 w-12 text-[#1a365d] mx-auto mb-2" />
                  <h4 className="font-heading text-2xl font-bold text-[#1a365d] uppercase">1st Place</h4>
                </div>
                <div className="p-4 bg-white text-center">
                  <p className="text-slate-600 font-medium">Champions</p>
                </div>
              </Card>

              {/* 2nd Place */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300" data-testid="prize-2nd-card">
                <div className="bg-gradient-to-br from-[#c0c0c0] to-[#a8a8a8] p-6 text-center">
                  <Award className="h-12 w-12 text-[#1a365d] mx-auto mb-2" />
                  <h4 className="font-heading text-2xl font-bold text-[#1a365d] uppercase">2nd Place</h4>
                </div>
                <div className="p-4 bg-white text-center">
                  <p className="text-slate-600 font-medium">Runners Up</p>
                </div>
              </Card>

              {/* 3rd Place */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300" data-testid="prize-3rd-card">
                <div className="bg-gradient-to-br from-[#cd7f32] to-[#b36b2a] p-6 text-center">
                  <Award className="h-12 w-12 text-white mx-auto mb-2" />
                  <h4 className="font-heading text-2xl font-bold text-white uppercase">3rd Place</h4>
                </div>
                <div className="p-4 bg-white text-center">
                  <p className="text-slate-600 font-medium">Third Overall</p>
                </div>
              </Card>

              {/* Last Place */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300" data-testid="prize-last-card">
                <div className="bg-gradient-to-br from-[#1a365d] to-[#0f2342] p-6 text-center">
                  <Gift className="h-12 w-12 text-[#f7dc00] mx-auto mb-2" />
                  <h4 className="font-heading text-2xl font-bold text-white uppercase">Last Place</h4>
                </div>
                <div className="p-4 bg-white text-center">
                  <p className="text-slate-600 font-medium">Better Luck Next Year!</p>
                </div>
              </Card>

              {/* Raffle Prizes */}
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-4" data-testid="prize-raffle-card">
                <div className="bg-gradient-to-r from-[#f7dc00] to-[#ffe55c] p-6 flex items-center justify-center gap-4">
                  <Star className="h-10 w-10 text-[#1a365d]" />
                  <h4 className="font-heading text-2xl font-bold text-[#1a365d] uppercase">Raffle Prizes</h4>
                  <Star className="h-10 w-10 text-[#1a365d]" />
                </div>
                <div className="p-4 bg-white text-center">
                  <p className="text-slate-600 font-medium">Raffle drawings throughout the event — everyone has a chance to win!</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Notice */}
      <section className="py-12 bg-[#f7dc00]">
        <div className="container mx-auto px-6 text-center">
          <Shield className="h-12 w-12 text-[#1a365d] mx-auto mb-4" />
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-[#1a365d] uppercase mb-4" data-testid="payment-notice-heading">
            Payment Information
          </h3>
          <p className="text-[#1a365d] text-lg max-w-2xl mx-auto">
            Payment can be made at the <strong>Local 4 Credit Union</strong> or at <strong>the Hall</strong>. 
            Please complete your registration online first, then arrange payment.
          </p>
          <div className="max-w-2xl mx-auto mt-6 bg-[#1a365d] text-white rounded-xl p-5 text-left shadow-lg" data-testid="credit-union-note">
            <div className="flex items-start gap-3">
              <CreditCard className="h-6 w-6 text-[#f7dc00] shrink-0 mt-0.5" />
              <p className="text-sm md:text-base">
                <strong className="text-[#f7dc00] uppercase tracking-wide">Important:</strong>{" "}
                When paying at the Credit Union, please ask them to add a note identifying <strong>who the payment is for</strong> so we can match it to your registration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Online Payment Coming Soon Banner */}
      <section className="py-10 bg-gradient-to-r from-[#0f2342] via-[#1a365d] to-[#0f2342]" data-testid="online-payment-coming-soon">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto relative overflow-hidden rounded-2xl border-2 border-[#f7dc00] bg-[#0f2342] p-8 md:p-10 shadow-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f7dc00]/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f7dc00]/5 rounded-full blur-2xl" />
            <div className="relative flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-20 h-20 bg-[#f7dc00] rounded-2xl flex items-center justify-center shrink-0 shadow-lg rotate-3">
                <Sparkles className="h-10 w-10 text-[#1a365d]" />
              </div>
              <div className="flex-1">
                <span className="inline-block bg-[#f7dc00] text-[#1a365d] text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  Coming Soon
                </span>
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase mb-2">
                  Online Payment Methods
                </h3>
                <p className="text-white/80 text-base md:text-lg">
                  We're working on adding secure online payments so you can pay instantly. Stay tuned — it'll be available soon!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-[#1a365d]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-white uppercase mb-6" data-testid="about-heading">
                About This Event
              </h2>
              <p className="text-white/90 text-lg leading-relaxed mb-6">
                The ILWU Local 4 Golf Tournament is an annual tradition that brings together union members, 
                their families, and friends for a day of friendly competition and solidarity.
              </p>
              <p className="text-white/90 text-lg leading-relaxed mb-6">
                Whether you're a seasoned golfer or just looking to have some fun, this event is for you. 
                Register as an individual and we'll match you with a team, or bring your own foursome!
              </p>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="font-heading text-4xl font-bold text-[#f7dc00]">{tournamentInfo?.current_teams || 0}</p>
                  <p className="text-white/70 text-sm uppercase tracking-wider">Teams Registered</p>
                </div>
                <div className="text-center">
                  <p className="font-heading text-4xl font-bold text-[#f7dc00]">{tournamentInfo?.current_players || 0}</p>
                  <p className="text-white/70 text-sm uppercase tracking-wider">Players Signed Up</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/11890225/pexels-photo-11890225.jpeg" 
                alt="Golfers on course" 
                className="rounded-xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-[#f7dc00] p-6 rounded-xl shadow-xl">
                <Trophy className="h-12 w-12 text-[#1a365d]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2342] py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <img src={LOGO_URL} alt="ILWU Logo" className="w-12 h-12 rounded-full" />
              <div>
                <p className="text-white font-bold">ILWU Local 4</p>
                <p className="text-white/60 text-sm">International Longshore & Warehouse Union</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <Button
                variant="ghost"
                onClick={() => navigate("/admin")}
                className="text-white/60 hover:text-white hover:bg-white/10"
                data-testid="admin-link"
              >
                Admin Access
              </Button>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} ILWU Local 4 Golf Tournament. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
