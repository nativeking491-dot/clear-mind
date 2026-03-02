import { cn } from "@/lib/utils";
import type { TabId } from "../App";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BottomNavProps {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const NAV_OCID: Record<TabId, string> = {
  home: "nav.home_tab",
  checkin: "nav.checkin_tab",
  urgelog: "nav.urgelog_tab",
  journal: "nav.journal_tab",
  progress: "nav.progress_tab",
};

export default function BottomNav({
  tabs,
  activeTab,
  onTabChange,
}: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 h-[var(--nav-height)] bg-card border-t border-border pb-safe"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <div className="flex h-full items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={NAV_OCID[tab.id]}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[3.5rem]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive && "scale-110",
                  )}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium tracking-wide transition-all duration-200",
                  isActive ? "font-semibold" : "",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
