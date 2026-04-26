import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertTriangle, MapPin, Package, Search, ShoppingCart, Star, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, Crop, Order } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { icon: <ShoppingCart className="w-4 h-4" />, label: "Browse Crops", id: "browse" },
  { icon: <Package className="w-4 h-4" />, label: "Order Management", id: "orders" },
  { icon: <Star className="w-4 h-4" />, label: "Trust Score", id: "trust" },
  { icon: <AlertTriangle className="w-4 h-4" />, label: "Anomaly Alerts", id: "alerts" },
];

export default function BuyerDashboard() {
  const [section, setSection] = useState("browse");
  const [search, setSearch] = useState("");
  const [crops, setCrops] = useState<Crop[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    api.browseCrops()
      .then(setCrops)
      .catch(error => {
        toast({ title: "Could not load crops", description: error instanceof Error ? error.message : "Backend is not running." });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const filteredCrops = useMemo(
    () => crops.filter(crop => crop.name.toLowerCase().includes(search.toLowerCase())),
    [crops, search]
  );

  const buyCrop = async (crop: Crop) => {
    try {
      const result = await api.placeOrder({
        crop_id: crop._id,
        buyer_id: localStorage.getItem("agrismart_user") || "demo-buyer",
        quantity: 1,
      });
      setOrders(prev => [result.order, ...prev]);
      setCrops(prev => prev.map(item => item._id === crop._id ? { ...item, quantity: item.quantity - 1 } : item));
      toast({ title: "Order placed", description: `${crop.name} order is ready for delivery.` });
    } catch (error) {
      toast({ title: "Could not place order", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout
      title="Buyer Dashboard"
      role="buyer"
      navItems={navItems}
      activeSection={section}
      onSectionChange={setSection}
      extraNavbar={
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
          <Wallet className="w-4 h-4" /> Rs 24,500
        </button>
      }
    >
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Available Crops", value: crops.length },
            { label: "Session Orders", value: orders.length },
            { label: "Wallet Balance", value: "Rs 24,500" },
            { label: "Avg Trust Score", value: "4.5" },
          ].map(item => (
            <div key={item.label} className="stat-card bg-card">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-heading font-bold mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {section === "browse" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> Browse Crops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search crops..." className="pl-10" value={search} onChange={event => setSearch(event.target.value)} />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Locations</SelectItem></SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {loading && <p className="text-sm text-muted-foreground">Loading crops...</p>}
                {!loading && filteredCrops.length === 0 && <p className="text-sm text-muted-foreground">No crops available yet.</p>}
                {filteredCrops.map(crop => (
                  <div key={crop._id} className="flex items-center gap-4 p-4 rounded-xl border hover:border-primary/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{crop.name} <span className="text-xs text-muted-foreground">by {crop.farmer_id}</span></p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Farm listing · {crop.quantity} kg · {crop.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-primary">Rs {crop.price}/kg</p>
                      <p className="text-xs text-muted-foreground">Trust 4.5</p>
                    </div>
                    <Button size="sm" onClick={() => buyCrop(crop)} disabled={crop.quantity <= 0}>Buy 1kg</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {section === "orders" && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Order Management</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {orders.length === 0 && <p className="text-sm text-muted-foreground">Orders placed in this session will appear here.</p>}
              {orders.map(order => (
                <div key={order._id} className="flex items-center gap-4 p-4 rounded-xl border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{order.crop_id} · {order.quantity} kg</p>
                    <p className="text-xs text-muted-foreground">{order._id}</p>
                  </div>
                  <p className="font-heading font-semibold">Rs {order.total_price}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">{order.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {section === "trust" && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Farmer Trust Scores</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {crops.map(crop => (
                <div key={crop._id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {crop.farmer_id.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{crop.farmer_id}</p>
                    <p className="text-xs text-muted-foreground">{crop.name}</p>
                  </div>
                  <span className="text-sm font-medium text-warning">4.5</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {section === "alerts" && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> Anomaly Alerts</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Price anomalies can be checked from the backend at /alerts/anomaly.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
