import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Calendar, MapPin, Users, Trophy, DollarSign, Zap, Target, Star, Gift, Clock, Share2 } from "lucide-react";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : "/api";
const LOGO_URL = "/images/ilwu_golf_logo.png";
const SITE_URL = "https://localfore.vercel.app/";

export default function Flyer() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    axios.get(`${API}/tournament-info`).then((r) => setInfo(r.data)).catch(() => {});
  }, []);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const url = SITE_URL;
    const shareData = {
      title: "ILWU Local 4 Golf Tournament",
      text: "Join us September 3, 2026 at Club Green Meadows for the ILWU Local 4 Golf Tournament!",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Tournament link copied to clipboard!");
      }
    } catch {
      // user cancelled
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Toolbar - hidden when printing */}
      <header className="bg-[#1a365d] py-4 print:hidden" data-testid="flyer-toolbar">
        <div className="container mx-auto px-6 flex items-center justify-between flex-wrap gap-3">
          <Link to="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-heading text-xl font-bold uppercase">Back to Home</span>
          </Link>
          <div className="flex gap-3">
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-[#1a365d] font-bold uppercase tracking-wide"
              data-testid="share-event-btn"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-[#f7dc00] text-[#1a365d] hover:bg-[#ffe55c] font-bold uppercase tracking-wide"
              data-testid="print-flyer-btn"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Flyer
            </Button>
          </div>
        </div>
      </header>

      {/* Flyer Page - Letter size (8.5 x 11 in) */}
      <main className="py-8 print:py-0">
        <div
          className="flyer mx-auto bg-white shadow-2xl print:shadow-none relative overflow-hidden"
          data-testid="flyer-page"
        >
          {/* Top Band */}
          <div className="bg-gradient-to-br from-[#1a365d] via-[#0f2342] to-[#1a365d] px-10 pt-10 pb-8 relative">
            {/* Decorative accents */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f7dc00]/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#f7dc00]/10 rounded-full blur-2xl" />

            <div className="relative flex items-center gap-6">
              <img
                src={LOGO_URL}
                alt="ILWU Local 4 Golf Tournament"
                className="w-32 h-32 rounded-full shadow-2xl border-4 border-[#f7dc00] shrink-0 object-cover"
                data-testid="flyer-logo"
              />
              <div className="flex-1">
                <p className="text-[#f7dc00] font-bold uppercase tracking-widest text-sm mb-2">
                  ILWU Local 4 Presents
                </p>
                <h1 className="font-heading text-5xl font-bold text-white uppercase leading-none tracking-tight">
                  Golf
                </h1>
                <h1 className="font-heading text-5xl font-bold text-[#f7dc00] uppercase leading-none tracking-tight mt-1">
                  Tournament
                </h1>
                <p className="text-white/80 mt-3 text-lg">Union brothers, sisters &amp; friends — join us on the course!</p>
              </div>
            </div>
          </div>

          {/* Hero Details Bar */}
          <div className="bg-[#f7dc00] px-10 py-5 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-7 w-7 text-[#1a365d]" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a365d]/70">Date</p>
                <p className="font-heading text-xl font-bold text-[#1a365d]">September 3, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-7 w-7 text-[#1a365d]" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a365d]/70">Where</p>
                <p className="font-heading text-xl font-bold text-[#1a365d]">Club Green Meadows</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-7 w-7 text-[#1a365d]" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1a365d]/70">Schedule</p>
                <p className="font-heading text-base font-bold text-[#1a365d] leading-tight">
                  Check-in 7:00 AM<br />Shotgun 8:00 AM
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-10 py-8 space-y-8">
            {/* Pricing */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#1a365d] rounded-lg flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-[#f7dc00]" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-[#1a365d] uppercase">Entry Fee</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-[#f7dc00] bg-[#f7dc00]/10 rounded-xl p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#1a365d]/70">Early Bird</p>
                  <p className="font-heading text-4xl font-bold text-[#1a365d]">$125</p>
                  <p className="text-sm text-[#1a365d]/80 mt-1">per player · before June 20</p>
                </div>
                <div className="border-2 border-slate-300 bg-slate-50 rounded-xl p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Regular</p>
                  <p className="font-heading text-4xl font-bold text-slate-700">$150</p>
                  <p className="text-sm text-slate-600 mt-1">per player · starting June 20</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-3">
                <span className="font-bold text-[#1a365d]">Format:</span> Best Ball Scramble · Shotgun start · 4-person teams · Max 18 teams
              </p>
              <p className="mt-3 inline-flex items-center gap-2 bg-[#1a365d] text-[#f7dc00] font-bold uppercase tracking-wide text-sm px-4 py-2 rounded-full shadow-md" data-testid="lunch-callout">
                <Gift className="h-4 w-4" />
                Lunch Provided — Included with Entry
              </p>
            </section>

            {/* Prizes & Extras - two columns */}
            <section className="grid grid-cols-2 gap-8">
              {/* Team Prizes */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#1a365d] rounded-lg flex items-center justify-center shrink-0">
                    <Trophy className="h-5 w-5 text-[#f7dc00]" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-[#1a365d] uppercase">Team Prizes</h2>
                </div>
                <ul className="space-y-2.5">
                  <li className="flex items-center gap-3 bg-gradient-to-r from-[#f7dc00] to-[#ffe55c] rounded-lg px-4 py-2.5">
                    <Trophy className="h-5 w-5 text-[#1a365d] shrink-0" />
                    <span className="font-bold text-[#1a365d]">1st Place — Champions</span>
                  </li>
                  <li className="flex items-center gap-3 bg-slate-200 rounded-lg px-4 py-2.5">
                    <Trophy className="h-5 w-5 text-slate-700 shrink-0" />
                    <span className="font-bold text-slate-800">2nd Place — Runners Up</span>
                  </li>
                  <li className="flex items-center gap-3 bg-amber-100 rounded-lg px-4 py-2.5">
                    <Trophy className="h-5 w-5 text-amber-800 shrink-0" />
                    <span className="font-bold text-amber-900">3rd Place — Third Overall</span>
                  </li>
                  <li className="flex items-center gap-3 bg-[#1a365d] rounded-lg px-4 py-2.5">
                    <Gift className="h-5 w-5 text-[#f7dc00] shrink-0" />
                    <span className="font-bold text-white">Last Place — Better Luck Next Year!</span>
                  </li>
                </ul>
              </div>

              {/* Competitions / Extras */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#1a365d] rounded-lg flex items-center justify-center shrink-0">
                    <Star className="h-5 w-5 text-[#f7dc00]" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-[#1a365d] uppercase">On The Course</h2>
                </div>
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                    <Zap className="h-5 w-5 text-[#1a365d] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#1a365d]">Long Drive Contest</p>
                      <p className="text-xs text-slate-600">Longest drive wins</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                    <Target className="h-5 w-5 text-[#1a365d] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#1a365d]">Closest to the Pin</p>
                      <p className="text-xs text-slate-600">Precision counts</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                    <Star className="h-5 w-5 text-[#1a365d] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#1a365d]">Raffle Prizes</p>
                      <p className="text-xs text-slate-600">Drawings throughout the event</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
                    <Gift className="h-5 w-5 text-[#1a365d] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#1a365d]">Mulligans</p>
                      <p className="text-xs text-slate-600">Available for purchase</p>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Registration & Payment */}
            <section className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#1a365d] rounded-lg flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-[#f7dc00]" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-[#1a365d] uppercase">How To Register</h2>
                </div>
                <ol className="space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2">
                    <span className="w-5 h-5 bg-[#1a365d] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <span>Visit <strong className="text-[#1a365d]">the tournament website</strong> (QR code below)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 bg-[#1a365d] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <span>Register as an <strong>individual</strong> or bring a <strong>team of 4</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 bg-[#1a365d] text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <span>Arrange payment at the <strong>Credit Union</strong> or <strong>the Hall</strong></span>
                  </li>
                </ol>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#1a365d] rounded-lg flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 text-[#f7dc00]" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-[#1a365d] uppercase">Payment</h2>
                </div>
                <div className="text-sm text-slate-700 space-y-2">
                  <p><strong className="text-[#1a365d]">Local 4 Credit Union</strong> or <strong className="text-[#1a365d]">the Hall</strong></p>
                  <p className="bg-[#f7dc00]/30 border-l-4 border-[#f7dc00] px-3 py-2 text-xs">
                    <strong>Important:</strong> When paying at the Credit Union, please ask them to add a note with <strong>who the payment is for</strong>.
                  </p>
                  <p className="bg-[#1a365d] text-[#f7dc00] font-bold uppercase tracking-wide text-sm px-3 py-2 rounded-lg text-center shadow-md" data-testid="online-payment-callout">
                    Online Payments Coming Soon!
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Band with QR */}
          <div className="bg-[#1a365d] px-10 py-6 flex items-center justify-between gap-6 text-white mt-auto">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-lg shrink-0" data-testid="flyer-qr">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(SITE_URL)}`}
                  alt="Register QR code"
                  className="w-24 h-24 block"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#f7dc00]">Scan to Register</p>
                <p className="font-heading text-xl font-bold leading-tight">Register Online</p>
                <p className="text-xs text-white/70 break-all">
                  {SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-heading text-lg font-bold uppercase">ILWU Local 4</p>
              <p className="text-xs text-white/70">International Longshore &amp; Warehouse Union</p>
              <p className="text-[10px] text-white/50 mt-1">Questions? Contact the Hall.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Print styles */}
      <style>{`
        .flyer {
          width: 8.5in;
          min-height: 11in;
          display: flex;
          flex-direction: column;
        }
        @media print {
          @page { size: letter; margin: 0; }
          body { margin: 0; background: white !important; }
          .flyer { box-shadow: none !important; width: 8.5in; min-height: 11in; }
        }
      `}</style>
    </div>
  );
}
