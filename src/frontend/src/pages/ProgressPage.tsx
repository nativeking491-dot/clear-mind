import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BarChart2, Calendar, Loader2, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useMilestones,
  useProfile,
  useSetRecoveryStartDate,
  useStats,
} from "../hooks/useQueries";

const MILESTONE_EMOJIS: Record<number, string> = {
  1: "🌱",
  3: "🌿",
  7: "✨",
  14: "💫",
  30: "🌙",
  60: "⭐",
  90: "🏆",
  180: "👑",
  365: "🦋",
};

function StatCard({
  label,
  value,
  emoji,
  isLoading,
}: {
  label: string;
  value: number;
  emoji: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border shadow-xs p-4 flex flex-col gap-1">
      <span className="text-2xl">{emoji}</span>
      {isLoading ? (
        <Skeleton className="h-8 w-16 mt-1" />
      ) : (
        <p className="font-display text-3xl font-bold text-foreground tabular-nums">
          {value}
        </p>
      )}
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

function MilestoneBadge({
  label,
  days,
  earned,
  emoji,
  index,
}: {
  label: string;
  days: number;
  earned: boolean;
  emoji: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={cn(
        "relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200",
        earned
          ? "border-primary/50 bg-primary/8 shadow-card"
          : "border-border bg-card opacity-50",
      )}
    >
      {earned && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-success flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">✓</span>
        </div>
      )}
      <span
        className={cn(
          "text-3xl transition-all",
          earned ? "" : "grayscale opacity-60",
        )}
      >
        {emoji}
      </span>
      <div className="text-center">
        <p
          className={cn(
            "font-display text-lg font-bold tabular-nums",
            earned ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {days}
        </p>
        <p
          className={cn(
            "text-[10px] uppercase tracking-wider font-medium",
            earned ? "text-primary" : "text-muted-foreground",
          )}
        >
          {days === 1 ? "day" : "days"}
        </p>
      </div>
      <p
        className={cn(
          "text-[11px] text-center font-medium leading-tight",
          earned ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
    </motion.div>
  );
}

function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRecoveryDate(ts: bigint | undefined): string {
  if (!ts) return "Not set";
  try {
    const ms = Number(ts / BigInt(1_000_000));
    return new Date(ms).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

export default function ProgressPage() {
  const [showDateInput, setShowDateInput] = useState(false);
  const [dateInput, setDateInput] = useState(getTodayDate());

  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: milestones, isLoading: milestonesLoading } = useMilestones();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const setDateMutation = useSetRecoveryStartDate();

  async function handleSetDate() {
    if (!dateInput) return;
    try {
      await setDateMutation.mutateAsync(dateInput);
      toast.success("Recovery start date saved! 🌱");
      setShowDateInput(false);
    } catch {
      toast.error("Failed to set date. Please try again.");
    }
  }

  const statsValues = {
    totalDaysClean: stats ? Number(stats.totalDaysClean) : 0,
    currentStreak: stats ? Number(stats.currentStreak) : 0,
    longestStreak: stats ? Number(stats.longestStreak) : 0,
    urgeCount: stats ? Number(stats.urgeCount) : 0,
    journalCount: stats ? Number(stats.journalCount) : 0,
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Progress
            </h1>
            <p className="text-xs text-muted-foreground">
              Your recovery journey at a glance
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 pb-8 space-y-6">
        {/* Recovery start date */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-card border border-border shadow-xs p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">
              Recovery Start Date
            </h3>
          </div>

          {profileLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : profile?.recoveryStartDate ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold text-foreground">
                  {formatRecoveryDate(profile.recoveryStartDate)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your journey began here
                </p>
              </div>
              <Button
                data-ocid="progress.set_startdate_button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDateInput(!showDateInput);
                  setDateInput(getTodayDate());
                }}
                className="rounded-xl shrink-0 text-xs"
              >
                Change
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Set your recovery start date to track your milestones
                accurately.
              </p>
              <Button
                data-ocid="progress.set_startdate_button"
                onClick={() => setShowDateInput(true)}
                size="sm"
                className="rounded-xl bg-primary text-primary-foreground font-semibold"
              >
                Set Start Date
              </Button>
            </div>
          )}

          {showDateInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-border space-y-3"
            >
              <label
                htmlFor="startdate"
                className="text-sm font-medium text-foreground"
              >
                Choose your recovery start date
              </label>
              <Input
                id="startdate"
                data-ocid="progress.startdate_input"
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                max={getTodayDate()}
                className="rounded-xl border-border text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSetDate}
                  disabled={setDateMutation.isPending || !dateInput}
                  size="sm"
                  className="rounded-xl bg-primary text-primary-foreground font-semibold flex-1"
                >
                  {setDateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save Date"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDateInput(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats grid */}
        <div>
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Your Stats
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Days Clean"
              value={statsValues.totalDaysClean}
              emoji="🌿"
              isLoading={statsLoading}
            />
            <StatCard
              label="Current Streak"
              value={statsValues.currentStreak}
              emoji="🔥"
              isLoading={statsLoading}
            />
            <StatCard
              label="Longest Streak"
              value={statsValues.longestStreak}
              emoji="🏆"
              isLoading={statsLoading}
            />
            <StatCard
              label="Urges Logged"
              value={statsValues.urgeCount}
              emoji="📊"
              isLoading={statsLoading}
            />
            <div className="col-span-2">
              <StatCard
                label="Journal Entries"
                value={statsValues.journalCount}
                emoji="📖"
                isLoading={statsLoading}
              />
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Milestones
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Earn badges as you reach each milestone. Keep going!
          </p>

          {milestonesLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : milestones && milestones.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {[...milestones]
                .sort((a, b) => Number(a.daysRequired) - Number(b.daysRequired))
                .map((milestone, i) => {
                  const days = Number(milestone.daysRequired);
                  const emoji = MILESTONE_EMOJIS[days] ?? "🌟";
                  return (
                    <MilestoneBadge
                      key={milestone.id}
                      label={milestone.milestoneLabel}
                      days={days}
                      earned={milestone.earned}
                      emoji={emoji}
                      index={i}
                    />
                  );
                })}
            </div>
          ) : (
            // Fallback hardcoded milestones if backend returns empty
            <div className="grid grid-cols-3 gap-3">
              {[
                { days: 1, label: "First Step" },
                { days: 3, label: "3 Days" },
                { days: 7, label: "One Week" },
                { days: 14, label: "Two Weeks" },
                { days: 30, label: "One Month" },
                { days: 60, label: "Two Months" },
                { days: 90, label: "Three Months" },
                { days: 180, label: "Half Year" },
                { days: 365, label: "One Year" },
              ].map(({ days, label }, i) => (
                <MilestoneBadge
                  key={days}
                  label={label}
                  days={days}
                  earned={statsValues.currentStreak >= days}
                  emoji={MILESTONE_EMOJIS[days] ?? "🌟"}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Motivational note */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary p-5 border border-primary/20">
          <p className="font-display text-base italic text-foreground leading-relaxed">
            "Every milestone you unlock is proof that you chose yourself over
            your cravings. That choice matters."
          </p>
        </div>
      </div>
    </div>
  );
}
