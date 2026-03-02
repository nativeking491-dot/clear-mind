import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAddJournalEntry, useJournalEntries } from "../hooks/useQueries";

function formatTimestamp(ts: bigint): string {
  try {
    const ms = Number(ts / BigInt(1_000_000));
    return new Date(ms).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown time";
  }
}

function EntryCard({
  entry,
  index,
}: {
  entry: { id: bigint; content: string; date: string; timestamp: bigint };
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = entry.content.length > 160;

  return (
    <motion.div
      data-ocid={`journal.item.${index + 1}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="p-4 rounded-xl bg-card border border-border shadow-xs"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          {formatTimestamp(entry.timestamp)}
        </span>
      </div>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
        {isLong && !expanded
          ? `${entry.content.slice(0, 160)}…`
          : entry.content}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline focus-visible:outline-none"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" /> Read more
            </>
          )}
        </button>
      )}
    </motion.div>
  );
}

export default function JournalPage() {
  const [content, setContent] = useState("");
  const { data: entries, isLoading } = useJournalEntries();
  const addMutation = useAddJournalEntry();

  const sortedEntries = useMemo(() => {
    if (!entries) return [];
    return [...entries].sort((a, b) => Number(b.timestamp - a.timestamp));
  }, [entries]);

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) return;
    try {
      await addMutation.mutateAsync(trimmed);
      toast.success("Journal entry saved. 📖");
      setContent("");
    } catch {
      toast.error("Failed to save entry. Please try again.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      void handleSubmit();
    }
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Journal
            </h1>
            <p className="text-xs text-muted-foreground">
              Express your thoughts freely
            </p>
          </div>
        </div>
      </header>

      <div className="px-5 pb-8 space-y-5">
        {/* Write entry */}
        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          <div className="p-5">
            <h2 className="font-semibold text-sm text-foreground mb-3">
              New Entry
            </h2>
            <div className="relative">
              <Textarea
                data-ocid="journal.content_input"
                placeholder="What's on your mind today? How are you feeling? What are you proud of or struggling with?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="resize-none rounded-xl border-border min-h-[140px] text-sm leading-relaxed pr-4"
                rows={5}
              />
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">
                {content.trim().length > 0
                  ? `${content.trim().length} chars · `
                  : ""}
                Ctrl+Enter to save
              </p>
              <Button
                data-ocid="journal.submit_button"
                onClick={handleSubmit}
                disabled={!content.trim() || addMutation.isPending}
                size="sm"
                className="rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-5"
              >
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Entry"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Prompts */}
        <div className="rounded-2xl bg-accent/20 border border-accent/30 p-4">
          <p className="text-xs font-medium text-accent-foreground uppercase tracking-wider mb-2">
            Writing Prompts
          </p>
          <ul className="text-xs text-foreground/70 space-y-1.5">
            <li>• What are three things I'm grateful for today?</li>
            <li>• What triggered me today, and how did I handle it?</li>
            <li>• What does my future self look like in one year?</li>
            <li>• What habit am I proud of building?</li>
          </ul>
        </div>

        {/* Entry list */}
        <div>
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-3">
            {sortedEntries.length > 0
              ? `All Entries (${sortedEntries.length})`
              : "Your Entries"}
          </h3>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : sortedEntries.length === 0 ? (
            <div
              data-ocid="journal.empty_state"
              className="rounded-2xl border border-dashed border-border p-10 text-center"
            >
              <p className="text-3xl mb-3">📖</p>
              <p className="font-semibold text-foreground text-sm">
                Your journal awaits
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Write your first entry above to begin your story.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-2">
                {sortedEntries.map((entry, i) => (
                  <EntryCard
                    key={entry.id.toString()}
                    entry={entry}
                    index={i}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
