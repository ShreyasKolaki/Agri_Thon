import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const roles = [
  { value: "farmer", label: "🌾 Farmer", path: "/farmer" },
  { value: "buyer", label: "🛒 Buyer", path: "/buyer" },
  { value: "delivery", label: "🚚 Delivery", path: "/delivery" },
];

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const selected = roles.find(r => r.value === role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({ title: "Select a role", description: "Please choose your role to continue", variant: "destructive" });
      return;
    }

    if (!selected) return;

    const identity = email.includes("@") ? { email } : { phone: email };

    try {
      const result = mode === "signup"
        ? await api.signup({ role, password, ...identity })
        : await api.login({ role, password, ...identity });

      if (result.error) {
        toast({ title: mode === "signup" ? "Signup failed" : "Login failed", description: result.error, variant: "destructive" });
        return;
      }

      toast({
        title: mode === "signup" ? "Account created" : "Login successful",
        description: mode === "signup" ? "Taking you to your dashboard." : "Welcome back.",
      });

      localStorage.setItem("agrismart_role", role);
      localStorage.setItem("agrismart_user", email);
      navigate(selected.path);
    } catch (error) {
      toast({
        title: "Backend unavailable",
        description: error instanceof Error ? error.message : "Start the backend on port 8010 and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, hsl(150 25% 12%), hsl(145 40% 20%))" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="card-elevated rounded-2xl border p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold">Welcome to AgriSmart</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "signup" ? "Create your account" : "Login to your dashboard"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email / Phone</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="Enter email or phone"
                  className="pl-10"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  className="pl-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full py-5 text-base font-heading font-semibold">
              {mode === "signup" ? "Create Account" : "Login"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
