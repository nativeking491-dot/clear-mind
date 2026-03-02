import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCheckIns, useProfile, useStats } from "../hooks/useQueries";

interface DashboardProps {
  onOpenEmergency: () => void;
}

const QUOTES = [
  {
    text: "Every day you choose clarity, you're rewriting your story.",
    author: "Unknown",
  },
  {
    text: "The chains of habit are too light to be felt until they are too heavy to be broken.",
    author: "Warren Buffett",
  },
  {
    text: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought.",
    author: "Unknown",
  },
  {
    text: "You are not your urges. You are the one who watches them.",
    author: "Unknown",
  },
  { text: "One day at a time is all we ever have.", author: "Unknown" },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  { text: "Progress, not perfection.", author: "12-Step Philosophy" },
  {
    text: "Your future self is watching you make decisions right now.",
    author: "Unknown",
  },
  {
    text: "Strength grows in the moments when you think you can't go on but you keep going anyway.",
    author: "Unknown",
  },
  {
    text: "The greatest weapon against stress is our ability to choose one thought over another.",
    author: "William James",
  },
  {
    text: "Every urge you resist makes the next one easier to resist.",
    author: "Unknown",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
];

function getStreakLabel(days: number): {
  emoji: string;
  message: string;
  color: string;
} {
  if (days === 0)
    return {
      emoji: "🌱",
      message: "Starting fresh today",
      color: "text-muted-foreground",
    };
  if (days === 1)
    return {
      emoji: "✨",
      message: "First day — amazing start!",
      color: "text-accent-foreground",
    };
  if (days < 7)
    return { emoji: "🌿", message: "Building momentum", color: "text-success" };
  if (days < 14)
    return { emoji: "💪", message: "One week strong!", color: "text-success" };
  if (days < 30)
    return {
      emoji: "🔥",
      message: "Two weeks of clarity",
      color: "text-primary",
    };
  if (days < 60)
    return { emoji: "⭐", message: "One month free!", color: "text-primary" };
  if (days < 90)
    return {
      emoji: "🏆",
      message: "Two months strong!",
      color: "text-primary",
    };
  return {
    emoji: "👑",
    message: "You're an inspiration!",
    color: "text-primary",
  };
}

function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Dashboard({ onOpenEmergency }: DashboardProps) {
  const { clear } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: checkIns } = useCheckIns();

  const today = getTodayDate();

  const hasCheckedInToday = useMemo(() => {
    if (!checkIns) return false;
    return checkIns.some((c) => c.date === today);
  }, [checkIns, today]);

  const currentStreak = profile ? Number(profile.currentStreak) : 0;
  const longestStreak = profile ? Number(profile.longestStreak) : 0;
  const totalDaysClean = stats ? Number(stats.totalDaysClean) : 0;
  const urgeCount = stats ? Number(stats.urgeCount) : 0;

  const streakLabel = getStreakLabel(currentStreak);

  // Rotate quote based on day of year
  const quoteIndex = useMemo(() => {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = Number(new Date()) - Number(start);
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    return day % QUOTES.length;
  }, []);
  const quote = QUOTES[quoteIndex];

  const isLoading = profileLoading || statsLoading;

  return (
    <div className="min-h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 18
                ? "afternoon"
                : "evening"}{" "}
            🌿
          </h1>
        </div>
        <button
          type="button"
          onClick={clear}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 px-5 pb-6 space-y-5">
        {/* Streak counter — hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.38_0.09_195)] p-6 shadow-streak text-white"
        >
          {/* Background rings */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-white/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-white/8" />
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
          </div>

          <div className="relative flex items-end justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium mb-1 uppercase tracking-wider">
                Current Streak
              </p>
              {isLoading ? (
                <div className="h-20 w-32 rounded-xl bg-white/20 animate-pulse" />
              ) : (
                <>
                  <div className="flex items-end gap-2">
                    <span className="font-display text-7xl font-bold leading-none tabular-nums">
                      {currentStreak}
                    </span>
                    <span className="text-white/80 text-xl mb-2">
                      {currentStreak === 1 ? "day" : "days"}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 mt-2 ${streakLabel.color}`}
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    <span className="text-lg">{streakLabel.emoji}</span>
                    <span className="text-sm font-medium">
                      {streakLabel.message}
                    </span>
                  </div>
                </>
              )}
            </div>
            {/* Longest streak badge */}
            <div className="flex flex-col items-end gap-1 shrink-0">
              {isLoading ? (
                <div className="h-14 w-20 rounded-2xl bg-white/20 animate-pulse" />
              ) : (
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 text-center border border-white/20">
                  <p className="text-white/70 text-[10px] uppercase tracking-wider">
                    Best
                  </p>
                  <p className="font-display text-2xl font-bold text-white">
                    {longestStreak}
                  </p>
                  <p className="text-white/70 text-[10px]">days</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Daily check-in CTA */}
        {!isLoading && !hasCheckedInToday && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="rounded-2xl bg-accent/30 border border-accent/50 p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0 text-lg">
              📋
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">
                Check in for today
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Keep your streak alive — takes 10 seconds
              </p>
            </div>
            <Button
              data-ocid="home.checkin_button"
              size="sm"
              className="rounded-xl shrink-0 bg-primary text-primary-foreground font-semibold text-xs"
              onClick={() => {
                /* handled by tab navigation */
              }}
            >
              Go →
            </Button>
          </motion.div>
        )}

        {!isLoading && hasCheckedInToday && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="rounded-2xl bg-success/10 border border-success/30 p-4 flex items-center gap-3"
          >
            <span className="text-xl">✅</span>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Checked in for today!
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Great job — come back tomorrow
              </p>
            </div>
          </motion.div>
        )}

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Days Clean", value: totalDaysClean, emoji: "🌿" },
            { label: "Best Streak", value: longestStreak, emoji: "🏆" },
            { label: "Urges Logged", value: urgeCount, emoji: "📊" },
          ].map(({ label, value, emoji }) => (
            <div
              key={label}
              className="rounded-2xl bg-card border border-border p-3 text-center shadow-xs"
            >
              <div className="text-xl mb-1">{emoji}</div>
              {isLoading ? (
                <Skeleton className="h-7 w-10 mx-auto mb-1" />
              ) : (
                <p className="font-display text-2xl font-bold text-foreground">
                  {value}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                {label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Daily quote */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="rounded-2xl bg-card border border-border p-5 shadow-xs"
        >
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-3">
            Today's Reminder
          </p>
          <blockquote className="font-display text-lg italic text-foreground leading-relaxed">
            "{quote.text}"
          </blockquote>
          <p className="text-xs text-muted-foreground mt-2">— {quote.author}</p>
        </motion.div>

        {/* Emergency SOS button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <Button
            data-ocid="home.emergency_button"
            onClick={onOpenEmergency}
            variant="outline"
            className="w-full h-14 text-base font-semibold rounded-2xl border-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive/60 transition-all duration-200"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            SOS — I need support right now
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center px-5">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
