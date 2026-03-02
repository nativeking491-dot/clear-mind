import { Toaster } from "@/components/ui/sonner";
import { BarChart2, BookOpen, CheckSquare, Home, Zap } from "lucide-react";
import { useState } from "react";
import BottomNav from "./components/BottomNav";
import EmergencyModal from "./components/EmergencyModal";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import CheckInPage from "./pages/CheckInPage";
import Dashboard from "./pages/Dashboard";
import JournalPage from "./pages/JournalPage";
import LoginPage from "./pages/LoginPage";
import ProgressPage from "./pages/ProgressPage";
import UrgeLogPage from "./pages/UrgeLogPage";

export type TabId = "home" | "checkin" | "urgelog" | "journal" | "progress";

const TABS: {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "checkin", label: "Check-In", icon: CheckSquare },
  { id: "urgelog", label: "Urge Log", icon: Zap },
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "progress", label: "Progress", icon: BarChart2 },
];

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  if (isInitializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-muted-foreground font-body text-sm">
            Loading ClearMind…
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-[calc(var(--nav-height)+env(safe-area-inset-bottom,0px))]">
        {activeTab === "home" && (
          <Dashboard onOpenEmergency={() => setEmergencyOpen(true)} />
        )}
        {activeTab === "checkin" && <CheckInPage />}
        {activeTab === "urgelog" && <UrgeLogPage />}
        {activeTab === "journal" && <JournalPage />}
        {activeTab === "progress" && <ProgressPage />}
      </main>

      {/* Bottom navigation */}
      <BottomNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Emergency modal */}
      <EmergencyModal
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
      />

      <Toaster position="top-center" />
    </div>
  );
}
