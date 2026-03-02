import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Brain,
  Droplets,
  Dumbbell,
  Gamepad2,
  Music,
  Pencil,
  Phone,
  Thermometer,
  Wind,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface EmergencyModalProps {
  open: boolean;
  onClose: () => void;
}

const ACTIVITIES = [
  {
    icon: Wind,
    label: "Step outside",
    description: "Go for a 10-minute walk. Fresh air resets your mind.",
  },
  {
    icon: Dumbbell,
    label: "Move your body",
    description: "Do 20 push-ups or jumping jacks. Channel the energy.",
  },
  {
    icon: Droplets,
    label: "Drink water",
    description: "Slowly drink a full glass of cold water. Ground yourself.",
  },
  {
    icon: Phone,
    label: "Call a friend",
    description: "Reach out to someone you trust. Connection heals.",
  },
  {
    icon: Brain,
    label: "Breathe deeply",
    description: "4 counts in, hold 4, out 6. Repeat 5 times.",
  },
  {
    icon: BookOpen,
    label: "Read something",
    description: "Open a book or article. Redirect your attention.",
  },
  {
    icon: Thermometer,
    label: "Cold shower",
    description: "A cold shower reduces urge intensity within minutes.",
  },
  {
    icon: Music,
    label: "Play music",
    description: "Put on your favorite uplifting playlist and sing along.",
  },
  {
    icon: Pencil,
    label: "Write it down",
    description: "Journal what you're feeling right now. Let it out on paper.",
  },
  {
    icon: Gamepad2,
    label: "Play a game",
    description:
      "Open a puzzle or game. Engage a different part of your brain.",
  },
];

export default function EmergencyModal({ open, onClose }: EmergencyModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.dialog
          data-ocid="emergency.modal"
          open
          className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-primary/95 to-[oklch(0.35_0.08_190)] overflow-hidden w-full h-full max-w-none m-0 p-0 border-0"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          aria-label="Emergency support modal"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
          </div>

          {/* Header */}
          <div className="relative flex items-start justify-between p-6 pt-12">
            <div className="flex flex-col gap-2 max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🌿</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-white leading-tight">
                You've got this.
                <br />
                <span className="text-white/80 font-normal italic">
                  Take a breath.
                </span>
              </h1>
              <p className="text-white/70 text-sm leading-relaxed mt-1">
                This feeling will pass. Choose one activity to redirect your
                energy.
              </p>
            </div>
            <Button
              data-ocid="emergency.close_button"
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 hover:text-white shrink-0 mt-1"
              aria-label="Close emergency support"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Activities list */}
          <div className="relative flex-1 overflow-y-auto px-5 pb-8">
            <div className="grid gap-3">
              {ACTIVITIES.map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={activity.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/12 backdrop-blur-sm border border-white/15 hover:bg-white/18 transition-colors cursor-default"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {activity.label}
                      </p>
                      <p className="text-white/70 text-xs leading-relaxed mt-0.5">
                        {activity.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Close bar */}
          <div
            className="relative p-5 pt-2 pb-safe"
            style={{
              paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)",
            }}
          >
            <Button
              data-ocid="emergency.close_button"
              onClick={onClose}
              className="w-full h-14 text-base font-semibold bg-white text-primary hover:bg-white/90 rounded-2xl shadow-lg"
            >
              I'm feeling better now
            </Button>
          </div>
        </motion.dialog>
      )}
    </AnimatePresence>
  );
}
