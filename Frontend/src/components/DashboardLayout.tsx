import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, Globe, LogOut, User, Menu, X, Wallet, DollarSign } from "lucide-react";
import AIChatbot from "./AIChatbot";

interface NavItem {
  icon: ReactNode;
  label: string;
  id: string;
}

interface Props {
  title: string;
  role: string;
  navItems: NavItem[];
  activeSection: string;
  onSectionChange: (id: string) => void;
  children: ReactNode;
  extraNavbar?: ReactNode;
}

export default function DashboardLayout({ title, role, navItems, activeSection, onSectionChange, children, extraNavbar }: Props) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("agrismart_role");
    localStorage.removeItem("agrismart_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "hsl(var(--sidebar-background))" }}>
        <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
          <span className="text-xl font-heading font-bold text-sidebar-primary">Agri</span>
          <span className="text-xl font-heading font-bold text-sidebar-foreground">Smart</span>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onSectionChange(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === "alerts" && (
                <span className="ml-auto w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
              )}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b px-4 lg:px-6 h-14 flex items-center gap-3">
          <button className="lg:hidden p-1.5 rounded-md hover:bg-muted" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-heading font-semibold text-lg">{title}</h2>
          <div className="flex-1" />
          {extraNavbar}
          <button className="p-2 rounded-lg hover:bg-muted relative">
            <Bell className="w-4.5 h-4.5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted">
            <Globe className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* AI Chatbot */}
      <AIChatbot role={role} />
    </div>
  );
}
