import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CheckIn,
  JournalEntry,
  Milestone,
  Stats,
  UrgeLog,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Profile ────────────────────────────────────────────────
export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Stats ──────────────────────────────────────────────────
export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Stats | null>({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Check-ins ──────────────────────────────────────────────
export function useCheckIns() {
  const { actor, isFetching } = useActor();
  return useQuery<CheckIn[]>({
    queryKey: ["checkIns"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCheckIns();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitCheckIn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      date,
      wasClean,
      note,
    }: {
      date: string;
      wasClean: boolean;
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitCheckIn(date, wasClean, note);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["checkIns"] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
      void queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });
}

// ─── Urge Logs ──────────────────────────────────────────────
export function useUrgeLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<UrgeLog[]>({
    queryKey: ["urgeLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUrgeLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogUrge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      intensity,
      triggers,
      note,
    }: {
      intensity: number;
      triggers: string[];
      note: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.logUrge(BigInt(intensity), triggers, note);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["urgeLogs"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

// ─── Journal ────────────────────────────────────────────────
export function useJournalEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<JournalEntry[]>({
    queryKey: ["journal"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getJournalEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddJournalEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.addJournalEntry(content);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["journal"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

// ─── Milestones ─────────────────────────────────────────────
export function useMilestones() {
  const { actor, isFetching } = useActor();
  return useQuery<Milestone[]>({
    queryKey: ["milestones"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMilestones();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Recovery Start Date ─────────────────────────────────────
export function useSetRecoveryStartDate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (startDateStr: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.setRecoveryStartDate(startDateStr);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
      void queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });
}
