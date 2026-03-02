import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BookCheck, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCheckIns, useSubmitCheckIn } from "../hooks/useQueries";

function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function CheckInPage() {
  const today = getTodayDate();
  const [wasClean, setWasClean] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: checkIns, isLoading } = useCheckIns();
  const submitMutation = useSubmitCheckIn();

  const hasCheckedInToday = useMemo(() => {
    if (!checkIns) return false;
    return checkIns.some((c) => c.date === today);
  }, [checkIns, today]);

  const recentCheckIns = useMemo(() => {
    if (!checkIns) return [];
    return [...checkIns]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);
  }, [checkIns]);

  async function handleSubmit() {
    if (wasClean === null) return;
    try {
      await submitMutation.mutateAsync({ date: today, wasClean, note });
      setSubmitted(true);
      toast.success(
        wasClean
          ? "Great job staying clean today! 🌿"
          : "Thanks for checking in. Tomorrow is a new day. 💪",
      );
      setNote("");
    } catch {
      toast.error("Failed to submit check-in. Please try again.");
    }
  }

  const canSubmit = wasClean !== null && !submitMutation.isPending;

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Daily Check-In
            </h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 pb-8 space-y-5">
        {/* Check-in form */}
        <AnimatePresence mode="wait">
          {hasCheckedInToday || submitted ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-success/10 border border-success/30 p-6 text-center"
            >
              <div className="text-4xl mb-3">✅</div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Checked in for today!
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                You've already logged your check-in. Come back tomorrow.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card border border-border shadow-card overflow-hidden"
            >
              <div className="p-5">
                <h2 className="font-semibold text-lg text-foreground mb-1">
                  Did you stay clean today?
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Be honest with yourself. Every day counts.
                </p>

                {/* Yes/No toggle */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    type="button"
                    data-ocid="checkin.yes_button"
                    onClick={() => setWasClean(true)}
                    className={cn(
                      "flex flex-col items-center gap-2 py-5 px-4 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      wasClean === true
                        ? "border-success bg-success/15 shadow-md"
                        : "border-border bg-background hover:border-success/40 hover:bg-success/5",
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        "w-8 h-8 transition-colors",
                        wasClean === true
                          ? "text-success"
                          : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "font-semibold text-base",
                        wasClean === true ? "text-success" : "text-foreground",
                      )}
                    >
                      Yes! 🎉
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Stayed clean
                    </span>
                  </button>

                  <button
                    type="button"
                    data-ocid="checkin.no_button"
                    onClick={() => setWasClean(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 py-5 px-4 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      wasClean === false
                        ? "border-destructive bg-destructive/10 shadow-md"
                        : "border-border bg-background hover:border-destructive/40 hover:bg-destructive/5",
                    )}
                  >
                    <XCircle
                      className={cn(
                        "w-8 h-8 transition-colors",
                        wasClean === false
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "font-semibold text-base",
                        wasClean === false
                          ? "text-destructive"
                          : "text-foreground",
                      )}
                    >
                      Not today
                    </span>
                    <span className="text-xs text-muted-foreground">
                      That's okay, rise up
                    </span>
                  </button>
                </div>

                {/* Note */}
                <div className="space-y-2 mb-4">
                  <label
                    htmlFor="checkin-note"
                    className="text-sm font-medium text-foreground"
                  >
                    Add a note (optional)
                  </label>
                  <Textarea
                    id="checkin-note"
                    data-ocid="checkin.note_input"
                    placeholder="How are you feeling? What helped or what was difficult?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="resize-none rounded-xl border-border bg-background min-h-[100px] text-sm"
                    rows={3}
                  />
                </div>

                <Button
                  data-ocid="checkin.submit_button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full h-12 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Submit Check-In"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent history */}
        <div>
          <h3 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wider text-muted-foreground">
            Recent History
          </h3>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : recentCheckIns.length === 0 ? (
            <div
              data-ocid="checkin.empty_state"
              className="rounded-2xl border border-dashed border-border p-8 text-center"
            >
              <p className="text-muted-foreground text-sm">
                No check-ins yet. Start today!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCheckIns.map((entry, i) => (
                <motion.div
                  key={entry.id.toString()}
                  data-ocid={`checkin.item.${i + 1}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-xs"
                >
                  <div className="mt-0.5 shrink-0">
                    {entry.wasClean ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {entry.wasClean ? "Stayed clean" : "Relapsed"}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {entry.note}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
