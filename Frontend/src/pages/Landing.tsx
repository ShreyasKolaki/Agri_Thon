import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, BarChart3, Truck, Shield, Brain, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-farm.jpg";

const features = [
  { icon: Brain, title: "AI Quality Detection", desc: "Instant crop grading with computer vision" },
  { icon: TrendingUp, title: "Price Prediction", desc: "ML-powered mandi price forecasting" },
  { icon: Truck, title: "Smart Logistics", desc: "Optimal route & mandi suggestions" },
  { icon: Shield, title: "Trust & Transparency", desc: "Verified ratings and fraud detection" },
  { icon: BarChart3, title: "Profit Analytics", desc: "Track earnings and find best crops" },
  { icon: Sprout, title: "Farmer First", desc: "Simple UI designed for every farmer" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Smart farming landscape" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(150 25% 12% / 0.85), hsl(145 40% 20% / 0.7))" }} />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="ai-badge mb-6 text-sm">
              <Brain className="w-3.5 h-3.5" /> AI-Powered Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-heading leading-tight mb-4" style={{ color: "white" }}>
              Agri<span className="text-primary">Smart</span>
            </h1>
            <p className="text-xl md:text-2xl font-heading font-medium mb-2" style={{ color: "hsl(140 15% 90%)" }}>
              Predict. Decide. Profit.
            </p>
            <p className="text-lg mb-8" style={{ color: "hsl(140 10% 75%)" }}>
              AI-powered supply chain intelligence for farmers, buyers, and logistics partners.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-xl font-heading font-semibold animate-pulse-glow"
              onClick={() => navigate("/login")}
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
            Smart Features for Everyone
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            From field to market — AI insights at every step
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-elevated rounded-xl border p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-1">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © 2026 AgriSmart. Built with AI for Indian Agriculture.
      </footer>
    </div>
  );
}
