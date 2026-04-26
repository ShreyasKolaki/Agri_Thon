import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertCircle, CheckCircle, Clock, DollarSign, MapPin, Package, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, Order } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const earningsData = [
  { day: "Mon", earnings: 650 },
  { day: "Tue", earnings: 850 },
  { day: "Wed", earnings: 720 },
  { day: "Thu", earnings: 950 },
  { day: "Fri", earnings: 1100 },
  { day: "Sat", earnings: 800 },
  { day: "Sun", earnings: 450 },
];

const navItems = [
  { icon: <Truck className="w-4 h-4" />, label: "Available Deliveries", id: "deliveries" },
  { icon: <DollarSign className="w-4 h-4" />, label: "Earnings", id: "earnings" },
  { icon: <AlertCircle className="w-4 h-4" />, label: "Issue Reporting", id: "issues" },
];

export default function DeliveryDashboard() {
  const [section, setSection] = useState("deliveries");
  const [issueText, setIssueText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    api.availableDeliveries()
      .then(setOrders)
      .catch(error => {
        toast({ title: "Could not load deliveries", description: error instanceof Error ? error.message : "Backend is not running." });
      });
  }, [toast]);

  const acceptOrder = async (order: Order) => {
    try {
      await api.acceptDelivery({
        order_id: order._id,
        driver_id: localStorage.getItem("agrismart_user") || "demo-driver",
      });
      setOrders(prev => prev.filter(item => item._id !== order._id));
      toast({ title: "Delivery accepted", description: "The order has been assigned to you." });
    } catch (error) {
      toast({ title: "Could not accept delivery", description: error instanceof Error ? error.message : "Try again.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout
      title="Delivery Dashboard"
      role="delivery"
      navItems={navItems}
      activeSection={section}
      onSectionChange={setSection}
      extraNavbar={
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
          <DollarSign className="w-4 h-4" /> Rs 5,520 this week
        </span>
      }
    >
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Available", value: orders.length },
            { label: "Weekly Earnings", value: "Rs 5,520" },
            { label: "Avg Rating", value: "4.7" },
            { label: "Completed", value: "142" },
          ].map(item => (
            <div key={item.label} className="stat-card bg-card">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-heading font-bold mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        {section === "deliveries" && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-primary" /> Available Deliveries</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {orders.length === 0 && <p className="text-sm text-muted-foreground">No pending deliveries right now.</p>}
              {orders.map(order => (
                <div key={order._id} className="p-4 rounded-xl border">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{order.crop_id} · {order.quantity} kg</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.farmer_id} to buyer</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Pending route</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-bold text-primary">Rs {Math.round(order.total_price * 0.08)}</p>
                      <Button size="sm" className="mt-2" onClick={() => acceptOrder(order)}>Accept</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {section === "earnings" && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> Weekly Earnings</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Earnings (Rs)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {section === "issues" && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-primary" /> Report an Issue</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["Delivery Delay", "Product Damage", "Wrong Address", "Other"].map(type => (
                  <Button key={type} variant="outline" size="sm" onClick={() => setIssueText(prev => prev ? `${prev}, ${type}` : type)}>{type}</Button>
                ))}
              </div>
              <Textarea placeholder="Describe the issue..." value={issueText} onChange={event => setIssueText(event.target.value)} rows={4} />
              <Button onClick={() => { setSubmitted(true); setIssueText(""); setTimeout(() => setSubmitted(false), 3000); }}>
                Submit Report
              </Button>
              {submitted && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-sm font-medium">Issue reported successfully!</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
