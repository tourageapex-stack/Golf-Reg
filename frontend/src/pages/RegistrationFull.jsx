import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LOGO_URL = "/images/ilwu_logo.png";
const HERO_BG = "https://images.pexels.com/photos/5384079/pexels-photo-5384079.jpeg";

export default function RegistrationFull() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a365d]/95 to-[#0f2342]/90" />

      <div className="relative z-10 container mx-auto px-6 py-12 text-center">
        <img
          src={LOGO_URL}
          alt="ILWU Logo"
          className="w-28 h-28 md:w-36 md:h-36 mx-auto rounded-full shadow-2xl border-4 border-[#f7dc00] mb-8"
        />

        <h1
          className="font-heading text-4xl md:text-6xl font-bold text-white uppercase tracking-tight mb-4"
          data-testid="registration-full-heading"
        >
          Registration is Full
        </h1>
        <h2
          className="font-heading text-2xl md:text-4xl font-bold text-[#f7dc00] uppercase tracking-tight mb-8"
          data-testid="see-you-next-year"
        >
          Hope to see you next year
        </h2>
        <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
          The ILWU Local 4 Golf Tournament has reached its 21-team capacity.
        </p>

        <Button
          onClick={() => navigate("/")}
          className="bg-[#f7dc00] text-[#1a365d] hover:bg-[#ffe55c] font-bold uppercase tracking-wide py-6 px-8 text-lg shadow-xl"
          data-testid="full-back-home-btn"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Home
        </Button>

        <div className="mt-8">
          <Link to="/leaderboard" className="text-white/70 hover:text-[#f7dc00] text-sm uppercase tracking-wider font-semibold">
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
