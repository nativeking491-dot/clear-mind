import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLogUrge, useUrgeLogs } from "../hooks/useQueries";

const TRIGGERS = [
  "Boredom",
  "Stress",
  "Loneliness",
  "Anxiety",
  "Fatigue",
  "Curiosity",
  "Idle Time",
  "Social Media",
  "Other",
];

const INTENSITY_LABELS: Record<
  number,
  { label: string; color: string; emoji: string }
> = {
  1: { label: "Mild", color: "text-success", emoji: "🟢" },
  2: { label: "Moderate", color: "text-warning-foreground", emoji: "🟡" },
  3: { label: "Strong", color: "text-orange-500", emoji: "🟠" },
  4: { label: "Intense", color: "text-destructive", emoji: "🔴" },
  5: { label: "Overwhelming", color: "text-destructive", emoji: "🆘" },
};

function formatTimestamp(ts: bigint): string {
  try {
    const ms = Number(ts / BigInt(1_000_000));
    const date = new Date(ms);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown time";
  }
}

export default function UrgeLogPage() {
  const [intensity, setIntensity] = useState(3);
  const [selectedTriggers, setSelectedTriggers] = useState<Set<string>>(
    new Set(),
  );
  const [note, setNote] = useState("");

  const { data: urgeLogs, isLoading } = useUrgeLogs();
  const logMutation = useLogUrge();

  const sortedLogs = useMemo(() => {
    if (!urgeLogs) return [];
    return [...urgeLogs].sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [urgeLogs]);

  function toggleTrigger(trigger: string) {
    setSelectedTriggers((prev) => {
      const next = new Set(prev);
      if (next.has(trigger)) {
        next.delete(trigger);
      } else {
        next.add(trigger);
      }
      return next;
    });
  }

  async function handleSubmit() {
    try {
      await logMutation.mutateAsync({
        intensity,
        triggers: Array.from(selectedTriggers),
        note,
      });
      toast.success("Urge logged. Awareness is the first step to freedom. 🌿");
      setIntensity(3);
      setSelectedTriggers(new Set());
      setNote("");
    } catch {
      toast.error("Failed to log urge. Please try again.");
    }
  }

  const intensityInfo = INTENSITY_LABELS[intensity];

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-warning-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Urge Log
            </h1>
            <p className="text-xs text-muted-foreground">
              Track and understand your triggers
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 pb-8 space-y-5">
        {/* Form */}
        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          <div className="p-5 space-y-5">
            <h2 className="font-semibold text-base text-foreground">
              Log an urge
            </h2>

            {/* Intensity slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="intensity-slider"
                  className="text-sm font-medium text-foreground"
                >
                  Intensity
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{intensityInfo.emoji}</span>
                  <span
                    className={cn("text-sm font-semibold", intensityInfo.color)}
                  >
                    {intensity}/5 — {intensityInfo.label}
                  </span>
                </div>
              </div>
              <Slider
                id="intensity-slider"
                data-ocid="urgelog.intensity_input"
                min={1}
                max={5}
                step={1}
                value={[intensity]}
                onValueChange={([val]) => setIntensity(val)}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className="text-[10px] text-muted-foreground">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Trigger pills */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                What triggered it? (select all that apply)
              </p>
              <div className="flex flex-wrap gap-2">
                {TRIGGERS.map((trigger, i) => {
                  const isSelected = selectedTriggers.has(trigger);
                  return (
                    <button
                      type="button"
                      key={trigger}
                      data-ocid={`urgelog.trigger.checkbox.${i + 1}`}
                      onClick={() => toggleTrigger(trigger)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-primary/5",
                      )}
                    >
                      {trigger}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label
                htmlFor="urge-note"
                className="text-sm font-medium text-foreground"
              >
                Additional note (optional)
              </label>
              <Textarea
                id="urge-note"
                data-ocid="urgelog.note_input"
                placeholder="What's going on? How are you feeling right now?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none rounded-xl border-border min-h-[90px] text-sm"
                rows={3}
              />
            </div>

            <Button
              data-ocid="urgelog.submit_button"
              onClick={handleSubmit}
              disabled={logMutation.isPending}
              className="w-full h-12 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {logMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging…
                </>
              ) : (
                "Log Urge"
              )}
            </Button>
          </div>
        </div>

        {/* Recent logs */}
        <div>
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
            Recent Urge Logs
          </h3>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : sortedLogs.length === 0 ? (
            <div
              data-ocid="urgelog.empty_state"
              className="rounded-2xl border border-dashed border-border p-8 text-center"
            >
              <p className="text-muted-foreground text-sm">
                No urges logged yet — great work!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedLogs.slice(0, 20).map((log, i) => {
                const info =
                  INTENSITY_LABELS[Number(log.intensity)] ??
                  INTENSITY_LABELS[3];
                return (
                  <motion.div
                    key={log.id.toString()}
                    data-ocid={`urgelog.item.${i + 1}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="p-4 rounded-xl bg-card border border-border shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{info.emoji}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-semibold border-current",
                            info.color,
                          )}
                        >
                          {Number(log.intensity)}/5 {info.label}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    {log.triggers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {log.triggers.map((t) => (
                          <span
                            key={t}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {log.note && (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {log.note}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
