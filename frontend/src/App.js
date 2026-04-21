import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "@/pages/LandingPage";
import IndividualRegistration from "@/pages/IndividualRegistration";
import TeamRegistration from "@/pages/TeamRegistration";
import Confirmation from "@/pages/Confirmation";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import CheckIn from "@/pages/CheckIn";
import Leaderboard from "@/pages/Leaderboard";

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register/individual" element={<IndividualRegistration />} />
          <Route path="/register/team" element={<TeamRegistration />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/checkin" element={<CheckIn />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
