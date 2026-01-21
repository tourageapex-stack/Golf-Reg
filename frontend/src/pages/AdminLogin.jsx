import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock, User } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_greenmeadows-golf/artifacts/n4xo0dyh_IMG_1411.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast.error("Please enter both username and password");
      return;
    }

    setLoading(true);
    
    try {
      // Test credentials with admin verify endpoint
      await axios.get(`${API}/admin/verify`, {
        auth: {
          username: credentials.username,
          password: credentials.password
        }
      });
      
      // Store credentials in sessionStorage for subsequent requests
      sessionStorage.setItem("adminAuth", btoa(`${credentials.username}:${credentials.password}`));
      
      toast.success("Login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 401) {
        toast.error("Invalid username or password");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a365d]">
      {/* Header */}
      <header className="py-4">
        <div className="container mx-auto px-6 flex items-center">
          <Link to="/" className="flex items-center gap-3 text-white hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <img src={LOGO_URL} alt="ILWU Logo" className="w-10 h-10 rounded-full border-2 border-[#f7dc00]" />
            <span className="font-heading text-xl font-bold uppercase">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0" data-testid="admin-login-card">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-[#1a365d] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-[#f7dc00]" />
              </div>
              <CardTitle className="font-heading text-2xl font-bold text-[#1a365d] uppercase">
                Admin Access
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-bold uppercase tracking-wider text-slate-600">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="username"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      className="h-12 pl-10 bg-slate-50 border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                      placeholder="Enter username"
                      data-testid="admin-username-input"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-slate-600">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={credentials.password}
                      onChange={handleChange}
                      className="h-12 pl-10 bg-slate-50 border-slate-200 focus:border-[#1a365d] focus:ring-[#1a365d]"
                      placeholder="Enter password"
                      data-testid="admin-password-input"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a365d] text-white hover:bg-[#1a365d]/90 font-bold uppercase tracking-wide py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="admin-login-btn"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
