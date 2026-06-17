"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { uid } from "./id";
import { demoPlan, emptyScenario, freshPlan } from "./seed";
import { Plan, Scenario } from "./types";

const STORAGE_KEY = "moneytimeline.plan.v1";

interface PlanContextValue {
  plan: Plan;
  activeScenario: Scenario;
  setActiveScenarioId: (id: string) => void;
  updateScenario: (id: string, updater: (s: Scenario) => Scenario) => void;
  updateActiveScenario: (updater: (s: Scenario) => Scenario) => void;
  addScenario: (name?: string) => void;
  duplicateScenario: (id: string) => void;
  deleteScenario: (id: string) => void;
  renameScenario: (id: string, name: string) => void;
  setBaseline: (id: string) => void;
  setAdvisor: (updater: (a: Plan["advisor"]) => Plan["advisor"]) => void;
  loadDemo: () => void;
  resetAll: () => void;
  importPlan: (plan: Plan) => void;
  /** Startet eine frische Planung aus dem Onboarding (markiert als onboarded). */
  startPlan: (scenario: Scenario) => void;
  /** Onboarding überspringen (aktuelle Daten/Demo behalten). */
  skipOnboarding: () => void;
  isReady: boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

function loadInitial(): Plan {
  if (typeof window === "undefined") return freshPlan();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Plan;
      if (parsed?.scenarios?.length) return parsed;
    }
  } catch {
    // ignorieren – fällt auf Demo zurück
  }
  return demoPlan();
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<Plan>(() => freshPlan());
  const [isReady, setIsReady] = useState(false);
  const firstLoad = useRef(true);

  // Erst nach dem Mount aus localStorage laden (vermeidet Hydration-Mismatch).
  useEffect(() => {
    setPlan(loadInitial());
    setIsReady(true);
  }, []);

  // Persistenz.
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    if (!isReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      // Speicher voll / nicht verfügbar – stillschweigend ignorieren
    }
  }, [plan, isReady]);

  const setActiveScenarioId = useCallback((id: string) => {
    setPlan((p) => ({ ...p, activeScenarioId: id }));
  }, []);

  const updateScenario = useCallback(
    (id: string, updater: (s: Scenario) => Scenario) => {
      setPlan((p) => ({
        ...p,
        scenarios: p.scenarios.map((s) => (s.id === id ? updater(s) : s)),
      }));
    },
    [],
  );

  const updateActiveScenario = useCallback(
    (updater: (s: Scenario) => Scenario) => {
      setPlan((p) => ({
        ...p,
        scenarios: p.scenarios.map((s) =>
          s.id === p.activeScenarioId ? updater(s) : s,
        ),
      }));
    },
    [],
  );

  const addScenario = useCallback((name?: string) => {
    setPlan((p) => {
      const sc = emptyScenario(name ?? `Szenario ${p.scenarios.length + 1}`);
      return { ...p, scenarios: [...p.scenarios, sc], activeScenarioId: sc.id };
    });
  }, []);

  const duplicateScenario = useCallback((id: string) => {
    setPlan((p) => {
      const src = p.scenarios.find((s) => s.id === id);
      if (!src) return p;
      const copy: Scenario = {
        ...structuredClone(src),
        id: uid("sc"),
        name: `${src.name} (Kopie)`,
        isBaseline: false,
      };
      return { ...p, scenarios: [...p.scenarios, copy], activeScenarioId: copy.id };
    });
  }, []);

  const deleteScenario = useCallback((id: string) => {
    setPlan((p) => {
      if (p.scenarios.length <= 1) return p;
      const remaining = p.scenarios.filter((s) => s.id !== id);
      const activeScenarioId =
        p.activeScenarioId === id ? remaining[0].id : p.activeScenarioId;
      const baselineScenarioId =
        p.baselineScenarioId === id ? remaining[0].id : p.baselineScenarioId;
      return { ...p, scenarios: remaining, activeScenarioId, baselineScenarioId };
    });
  }, []);

  const renameScenario = useCallback((id: string, name: string) => {
    setPlan((p) => ({
      ...p,
      scenarios: p.scenarios.map((s) => (s.id === id ? { ...s, name } : s)),
    }));
  }, []);

  const setBaseline = useCallback((id: string) => {
    setPlan((p) => ({
      ...p,
      baselineScenarioId: id,
      scenarios: p.scenarios.map((s) => ({ ...s, isBaseline: s.id === id })),
    }));
  }, []);

  const setAdvisor = useCallback(
    (updater: (a: Plan["advisor"]) => Plan["advisor"]) => {
      setPlan((p) => ({ ...p, advisor: updater(p.advisor) }));
    },
    [],
  );

  // Demo wird bewusst gewählt -> Onboarding gilt als erledigt.
  const loadDemo = useCallback(() => setPlan({ ...demoPlan(), onboarded: true }), []);
  const resetAll = useCallback(() => setPlan(freshPlan()), []);
  const importPlan = useCallback((imported: Plan) => setPlan(imported), []);

  const startPlan = useCallback((scenario: Scenario) => {
    setPlan({
      scenarios: [{ ...scenario, isBaseline: true }],
      activeScenarioId: scenario.id,
      baselineScenarioId: scenario.id,
      advisor: { enabled: false, clientName: "", caseName: "Kundenfall 1" },
      onboarded: true,
    });
  }, []);

  const skipOnboarding = useCallback(() => {
    setPlan((p) => ({ ...p, onboarded: true }));
  }, []);

  const activeScenario = useMemo(
    () =>
      plan.scenarios.find((s) => s.id === plan.activeScenarioId) ??
      plan.scenarios[0],
    [plan],
  );

  const value: PlanContextValue = {
    plan,
    activeScenario,
    setActiveScenarioId,
    updateScenario,
    updateActiveScenario,
    addScenario,
    duplicateScenario,
    deleteScenario,
    renameScenario,
    setBaseline,
    setAdvisor,
    loadDemo,
    resetAll,
    importPlan,
    startPlan,
    skipOnboarding,
    isReady,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan muss innerhalb von PlanProvider verwendet werden");
  return ctx;
}
