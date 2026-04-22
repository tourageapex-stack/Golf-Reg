import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CreditCard, Shield, Info } from "lucide-react";
import ZeffyEmbed from "@/components/ZeffyEmbed";

const LOGO_URL = "/images/ilwu_logo.png";

export default function PayOnline() {
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

      <main className="container mx-auto px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Title */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-[#f7dc00] text-[#1a365d] font-bold uppercase tracking-widest text-xs px-3 py-1 rounded-full mb-3">
              <CreditCard className="h-4 w-4" />
              Secure Online Payment
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#1a365d] uppercase" data-testid="pay-online-heading">
              Pay Your Tournament Entry
            </h1>
            <p className="text-slate-600 mt-3 text-lg">
              Complete your payment below through Zeffy — a 100% free platform for nonprofits.
            </p>
          </div>

          {/* Info Banner */}
          <Card className="border-2 border-[#f7dc00] bg-[#f7dc00]/10 shadow-md">
            <CardContent className="p-5 flex items-start gap-3">
              <Info className="h-5 w-5 text-[#1a365d] shrink-0 mt-0.5" />
              <div className="text-sm text-[#1a365d]">
                <p className="font-bold mb-1">Before you pay:</p>
                <ul className="space-y-1 list-disc list-inside text-slate-700">
                  <li>Complete your registration first so we can match your payment to your team.</li>
                  <li>If prompted, use the same name and email you registered with.</li>
                  <li>You can still pay at the <strong>Local 4 Credit Union</strong> or <strong>the Hall</strong> if you prefer.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Zeffy Embed */}
          <Card className="shadow-xl border-0 overflow-hidden" data-testid="zeffy-embed-card">
            <CardContent className="p-2 md:p-4 bg-white">
              <ZeffyEmbed />
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="h-3.5 w-3.5" />
            <span>Payment processing is securely handled by Zeffy. ILWU Local 4 never sees your card details.</span>
          </div>

          {/* Back Button */}
          <div className="text-center pt-2">
            <Button
              asChild
              variant="outline"
              className="border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white font-bold uppercase tracking-wide"
              data-testid="back-to-home-btn"
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
