import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Sprout, TrendingUp, ShoppingCart, Bell, Bot, DollarSign, Truck, ImagePlus, CheckCircle, ArrowUpRight, ArrowDownRight, CloudSun, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const priceData = [
  { day: "Mon", price: 22, predicted: 23 },
  { day: "Tue", price: 24, predicted: 25 },
  { day: "Wed", price: 23, predicted: 26 },
  { day: "Thu", price: 25, predicted: 27 },
  { day: "Fri", price: 28, predicted: 29 },
  { day: "Sat", price: 27, predicted: 31 },
  { day: "Sun", price: 30, predicted: 33 },
];

const earningsData = [
  { month: "Jan", earnings: 12000 },
  { month: "Feb", earnings: 15000 },
  { month: "Mar", earnings: 18000 },
  { month: "Apr", earnings: 22000 },
  { month: "May", earnings: 19000 },
  { month: "Jun", earnings: 25000 },
];

const mandiData = [
  { name: "Vashi Mandi", price: 28, distance: 15, score: 92 },
  { name: "Azadpur Mandi", price: 25, distance: 45, score: 78 },
  { name: "Koyambedu", price: 30, distance: 60, score: 85 },
];

const alerts = [
  { type: "price", message: "Tomato prices up 15% at Vashi Mandi", icon: TrendingUp, color: "text-success" },
  { type: "demand", message: "High demand for onions in Delhi region", icon: ArrowUpRight, color: "text-info" },
  { type: "weather", message: "Light rain expected in 2 days", icon: CloudSun, color: "text-warning" },
];

const navItems = [
  { icon: <Sprout className="w-4 h-4" />, label: "Add Crop", id: "add-crop" },
  { icon: <TrendingUp className="w-4 h-4" />, label: "Price Insights", id: "prices" },
  { icon: <ShoppingCart className="w-4 h-4" />, label: "Sell Produce", id: "sell" },
  { icon: <Bell className="w-4 h-4" />, label: "Smart Alerts", id: "alerts" },
  { icon: <DollarSign className="w-4 h-4" />, label: "Profit Dashboard", id: "profit" },
  { icon: <Truck className="w-4 h-4" />, label: "Logistics", id: "logistics" },
];

export default function FarmerDashboard() {
  const [section, setSection] = useState("add-crop");
  const [cropName, setCropName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [qualityResult, setQualityResult] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ predicted_price: number; suggestion: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleQualityDetect = () => {
    setQualityResult(null);
    setTimeout(() => setQualityResult("Grade A — Premium Quality ✅"), 1200);
  };

  const handleSubmitCrop = async () => {
    if (!cropName || !quantity || !price) {
      toast({ title: "Missing crop details", description: "Enter crop name, quantity, and price.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("name", cropName);
    formData.append("quantity", quantity);
    formData.append("price", price);
    formData.append("farmer_id", localStorage.getItem("agrismart_user") || "demo-farmer");
    if (image) formData.append("image", image);

    setSubmitting(true);
    try {
      await api.addCrop(formData);
      toast({ title: "Crop listed", description: `${cropName} is now available to buyers.` });
      setCropName("");
      setQuantity("");
      setPrice("");
      setImage(null);
    } catch (error) {
      toast({ title: "Could not add crop", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePredictPrice = async () => {
    if (!cropName) {
      toast({ title: "Enter a crop name", description: "Prediction needs a commodity name.", variant: "destructive" });
      return;
    }

    try {
      const result = await api.predictPrice(cropName);
      setPrediction(result);
    } catch (error) {
      toast({ title: "Prediction unavailable", description: error instanceof Error ? error.message : "Model service is not running.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Farmer Dashboard" role="farmer" navItems={navItems} activeSection={section} onSectionChange={setSection}>
      <div className="space-y-6 animate-fade-in">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Earnings", value: "₹1,11,000", change: "+18%", up: true },
            { label: "Crops Listed", value: "12", change: "+3", up: true },
            { label: "Avg Price", value: "₹26/kg", change: "+8%", up: true },
            { label: "Active Orders", value: "4", change: "-1", up: false },
          ].map(s => (
            <div key={s.label} className="stat-card bg-card">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-heading font-bold mt-1">{s.value}</p>
              <span className={`text-xs flex items-center gap-0.5 mt-1 ${s.up ? "text-success" : "text-destructive"}`}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.change}
              </span>
            </div>
          ))}
        </div>

        {/* Add Crop */}
        {section === "add-crop" && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sprout className="w-5 h-5 text-primary" /> Add New Crop</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Crop Name</Label>
                  <Input placeholder="e.g. Tomato, Onion" value={cropName} onChange={e => setCropName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Quantity (kg)</Label>
                  <Input type="number" placeholder="e.g. 500" value={quantity} onChange={e => setQuantity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Price (per kg)</Label>
                  <Input type="number" placeholder="e.g. 28" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
              </div>
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <Input type="file" accept="image/*" className="max-w-sm mx-auto" onChange={e => setImage(e.target.files?.[0] ?? null)} />
                <p className="text-sm text-muted-foreground mt-2">{image ? image.name : "Upload crop image for AI quality detection"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleQualityDetect}>
                  <Bot className="w-4 h-4 mr-2" />AI Quality Check
                </Button>
                <Button variant="outline" onClick={handleSubmitCrop} disabled={submitting}>{submitting ? "Submitting..." : "Submit Crop"}</Button>
              </div>
              {qualityResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium">{qualityResult}</span>
                  <span className="ai-badge ml-auto">AI Detection</span>
                </motion.div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Price Insights */}
        {section === "prices" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Mandi Prices & AI Prediction</CardTitle>
                <span className="ai-badge">AI Prediction</span>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} name="Current Price (₹/kg)" />
                    <Line type="monotone" dataKey="predicted" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 5" name="AI Predicted" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
              <Bot className="w-6 h-6 text-primary" />
              <div>
                <p className="font-heading font-semibold text-sm">AI Suggestion</p>
                <p className="text-sm text-muted-foreground">
                  {prediction
                    ? `Predicted price: Rs ${prediction.predicted_price.toFixed(2)}. Suggestion: ${prediction.suggestion}.`
                    : "Enter a crop name in Add Crop, then fetch the model prediction."}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handlePredictPrice}>Refresh</Button>
              <span className="ai-badge ml-auto">AI Suggestion</span>
            </motion.div>
          </div>
        )}

        {/* Sell Produce */}
        {section === "sell" && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> Sell Your Produce</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { crop: "Tomato", qty: "200 kg", grade: "A", status: "Listed" },
                  { crop: "Onion", qty: "500 kg", grade: "B+", status: "Sold" },
                  { crop: "Potato", qty: "300 kg", grade: "A", status: "Pending" },
                ].map(item => (
                  <div key={item.crop} className="flex items-center gap-4 p-3 rounded-lg border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sprout className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.crop}</p>
                      <p className="text-xs text-muted-foreground">{item.qty} · Grade {item.grade}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${item.status === "Sold" ? "bg-success/10 text-success" : item.status === "Listed" ? "bg-info/10 text-info" : "bg-warning/10 text-warning"}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <Button className="mt-4">+ List New Crop</Button>
            </CardContent>
          </Card>
        )}

        {/* Smart Alerts */}
        {section === "alerts" && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> Smart Alerts</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg border">
                  <a.icon className={`w-5 h-5 ${a.color}`} />
                  <p className="text-sm flex-1">{a.message}</p>
                  <span className="ai-badge">Alert</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Profit Dashboard */}
        {section === "profit" && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Earnings Overview</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="earnings" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={2} name="Earnings (₹)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="grid md:grid-cols-3 gap-4">
              {[{ crop: "Tomato", earning: "₹45,000" }, { crop: "Onion", earning: "₹32,000" }, { crop: "Potato", earning: "₹34,000" }].map(c => (
                <div key={c.crop} className="stat-card bg-card">
                  <p className="text-xs text-muted-foreground">Best Crop</p>
                  <p className="font-heading font-bold text-lg">{c.crop}</p>
                  <p className="text-sm text-primary font-medium">{c.earning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logistics */}
        {section === "logistics" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Best Mandi Suggestions</CardTitle>
              <span className="ai-badge">AI Suggestion</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {mandiData.map((m, i) => (
                <div key={m.name} className={`flex items-center gap-4 p-4 rounded-xl border ${i === 0 ? "border-primary/30 bg-primary/5" : ""}`}>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{m.name} {i === 0 && <span className="ai-badge ml-2">Recommended</span>}</p>
                    <p className="text-xs text-muted-foreground">₹{m.price}/kg · {m.distance}km away</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-heading font-bold text-primary">{m.score}/100</p>
                    <p className="text-[10px] text-muted-foreground">AI Score</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
