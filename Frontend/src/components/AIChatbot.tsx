import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const rolePrompts: Record<string, string> = {
  farmer: "You are AgriSmart AI assistant for farmers. Help with crop pricing, weather, best selling times, quality tips, and mandi suggestions. Keep answers short and practical.",
  buyer: "You are AgriSmart AI assistant for buyers. Help with finding quality produce, price comparisons, order tracking, and fraud detection tips. Keep answers short.",
  delivery: "You are AgriSmart AI assistant for delivery partners. Help with route optimization, delivery tips, earnings queries, and issue reporting. Keep answers short.",
};

// Simple local AI responses for demo
function getAIResponse(message: string, role: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("price") || lower.includes("rate")) {
    return role === "farmer"
      ? "🌾 Current tomato price is ₹25/kg at Azadpur Mandi. AI predicts a 12% rise in 3 days. **Suggestion: Wait before selling.**"
      : "Current market rates are competitive. I recommend checking listings filtered by quality grade for best value.";
  }
  if (lower.includes("weather")) return "🌤️ Forecast: Partly cloudy, 28°C. No rain expected for 5 days. Good conditions for harvesting.";
  if (lower.includes("sell") || lower.includes("mandi")) return "📊 Best mandi for you: **Vashi Mandi** (₹28/kg, 15km away). Azadpur offers ₹25/kg but is 45km away. AI recommends Vashi for better profit margin.";
  if (lower.includes("quality")) return "🔍 For best quality grading, ensure crops are clean, sorted by size, and photographed in natural light. Our AI can detect Grade A/B/C instantly.";
  if (lower.includes("delivery") || lower.includes("route")) return "🚚 Optimal route calculated: Use NH-48 → State Highway 12. Estimated time: 2.5 hours. Avoid the Pune expressway due to construction.";
  if (lower.includes("earning") || lower.includes("income")) return "💰 Your earnings this week: ₹4,250. That's 18% higher than last week. Keep it up!";
  if (lower.includes("help")) return "I can help with:\n- 📈 Price predictions\n- 🌤️ Weather updates\n- 🏪 Mandi suggestions\n- 🔍 Quality checks\n- 🚚 Delivery routes\n\nJust ask!";
  return "I'm your AgriSmart AI assistant. Ask me about prices, weather, quality detection, mandi suggestions, or any farming-related query! 🌱";
}

export default function AIChatbot({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `Hi! 👋 I'm your AgriSmart AI assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = async () => {
    if (!input.trim()) return;
    const question = input;
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const result = await api.chat(question);
      setMessages(prev => [...prev, { role: "assistant", content: result.response }]);
    } catch {
      const response = getAIResponse(question, role);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow animate-pulse-glow"
          >
            <Bot className="w-6 h-6 text-primary-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[520px] rounded-2xl border bg-card flex flex-col overflow-hidden"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-primary/5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-heading font-semibold">AgriSmart AI</p>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
              <span className="ai-badge text-[10px]">AI Powered</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}>
                    {m.content.split("\n").map((line, j) => <p key={j}>{line}</p>)}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl px-4 py-2 text-sm">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-3 flex gap-2">
              <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
                <Mic className="w-4 h-4" />
              </button>
              <Input
                placeholder="Ask anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={send} disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
