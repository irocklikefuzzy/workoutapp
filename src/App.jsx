import { useState, useEffect, useRef } from "react";
import { supabase, USER_ID, STATE_TABLE } from "./supabaseClient";

const TARGET_WORKOUT = {
  subtitle: "Your Murph Variation · Goal: Sub 60 min",
  sections: [
    { label: "Mile 1", detail: "Target 11:00", icon: "🏃" },
    { label: "5 Pull-ups", detail: "Banded · ~2 min", icon: "💪" },
    { label: "75 Push-ups", detail: "Full · ~15 min", icon: "⬇️" },
    { label: "300 Squats", detail: "Air · ~12 min", icon: "🦵" },
    { label: "Mile 2", detail: "Target 13:00", icon: "🏃" },
  ],
  finalForm: "Final Form (Month 6+): 1mi → 10 pull-ups → 200 push-ups → 300 squats → 1mi · Sub 60 min",
};

const phases = [
  {
    phase: "01", name: "Build the Base", weeks: "Weeks 1–4",
    accent: "#4a9eff",
    tagline: "Establish movement quality and cardio foundation",
    pullupFocus: "Log your Australian pull-up max every Sunday. This is your leading indicator.",
    schedule: [
      {
        id: "p1-sun", day: "Sunday — Push + Pull", hasTime: false,
        exercises: [
          { name: "Australian pull-ups", sets: "4 sets to near failure", note: "Track max reps — this number should climb weekly", trackReps: true, repsLabel: "Max reps (best set)", repsPlaceholder: "e.g. 8" },
          { name: "Negative pull-ups", sets: "3 × 3 reps", note: "Jump to bar, take 5 full seconds to lower" },
          { name: "Knee push-ups", sets: "4 × 15", note: "Full range — chest touches floor every rep" },
          { name: "Dead hang", sets: "3 × max hold", note: "Build toward 20 sec", trackHangTime: true, hangPlaceholder: "e.g. 18 sec" },
        ],
      },
      { id: "p1-mon", day: "Monday — Rest or Walk", hasTime: false, exercises: [] },
      {
        id: "p1-tue", day: "Tuesday — Run", hasTime: true,
        exercises: [
          { name: "1 mile run", sets: "Conversational pace", note: "You should be able to speak in sentences. Don't race it." },
          { name: "5 min walk cooldown", sets: "", note: "" },
        ],
      },
      {
        id: "p1-wed", day: "Wednesday — Squat + Core", hasTime: false,
        exercises: [
          { name: "Air squats", sets: "3 × 20", note: "Controlled tempo: 2 sec down, pause at bottom, drive up" },
          { name: "Donkey kickbacks", sets: "3 × 15", note: "Glute activation — squeeze at the top" },
          { name: "Plank", sets: "3 × 30–45 sec", note: "" },
          { name: "Hollow body hold", sets: "3 × 20 sec", note: "Core work directly transfers to pull-up stability" },
        ],
      },
      { id: "p1-thu", day: "Thursday — Volleyball 🏐", hasTime: false, exercises: [] },
      {
        id: "p1-fri", day: "Friday — Combo Circuit", hasTime: true,
        exercises: [
          { name: "0.5 mile run", sets: "Target sub-6:30", note: "" },
          { name: "8 rounds: 5 Aust. pull-ups / 8 knee push-ups / 10 squats", sets: "No time cap", note: "Rest as needed — focus on completing all 8 rounds" },
          { name: "0.5 mile run", sets: "", note: "Note your total time. This is your weekly benchmark." },
        ],
      },
      { id: "p1-sat", day: "Saturday — Rest", hasTime: false, exercises: [] },
    ],
    milestones: [
      { id: "p1-m1", text: "Australian pull-up max reps increases week over week" },
      { id: "p1-m2", text: "Complete all 8 rounds of Friday circuit without stopping" },
      { id: "p1-m3", text: "Run 1 mile without stopping (any pace)" },
      { id: "p1-m4", text: "20 consecutive knee push-ups" },
    ],
  },
  {
    phase: "02", name: "Unlock Full Push-up", weeks: "Weeks 5–8",
    accent: "#ff7c4a",
    tagline: "Transition to full push-ups. Increase pull-up load.",
    pullupFocus: "If you haven't gotten a pull-up yet, that's okay — banded reps are the path. Don't skip negatives.",
    schedule: [
      {
        id: "p2-sun", day: "Sunday — Pull Focus", hasTime: false,
        exercises: [
          { name: "Australian pull-ups (feet elevated)", sets: "5 sets to near failure", note: "Elevating feet increases difficulty — use a chair or bench", trackReps: true, repsLabel: "Max reps (best set)", repsPlaceholder: "e.g. 10" },
          { name: "Negative pull-ups", sets: "4 × 3–5 reps", note: "Prioritize slowness: 5–7 sec descent" },
          { name: "Banded pull-up attempts", sets: "3 × 3", note: "Use lightest band that lets you complete the rep", trackReps: true, repsLabel: "Unassisted reps achieved", repsPlaceholder: "e.g. 1" },
          { name: "Dead hang", sets: "3 × max", note: "Target 30 sec by end of phase", trackHangTime: true, hangPlaceholder: "e.g. 24 sec" },
        ],
      },
      { id: "p2-mon", day: "Monday — Rest", hasTime: false, exercises: [] },
      {
        id: "p2-tue", day: "Tuesday — Run Intervals", hasTime: true,
        exercises: [
          { name: "0.25 mile easy warmup", sets: "", note: "" },
          { name: "4 × 400m", sets: "90 sec rest between", note: "Target each 400m under 3:15. This builds your mile pace." },
          { name: "0.25 mile easy cooldown", sets: "", note: "" },
        ],
      },
      {
        id: "p2-wed", day: "Wednesday — Push-up Transition", hasTime: false,
        exercises: [
          { name: "Full push-up attempts", sets: "5 sets — go to failure then finish on knees", note: "Even 1–2 full reps per set counts. Log your full rep count.", trackReps: true, repsLabel: "Total full push-ups across all sets", repsPlaceholder: "e.g. 12" },
          { name: "Incline push-ups", sets: "3 × 15", note: "Use a bench or countertop — easier than floor, harder than knees" },
          { name: "Air squats", sets: "3 × 60", note: "Building toward 300 comfort" },
          { name: "Pike push-ups", sets: "3 × 8", note: "Shoulder strength for eventual pull-up" },
        ],
      },
      { id: "p2-thu", day: "Thursday — Volleyball 🏐", hasTime: false, exercises: [] },
      {
        id: "p2-fri", day: "Friday — Run-First Circuit", hasTime: true,
        exercises: [
          { name: "1 mile run", sets: "Target sub-12:30", note: "Full mile now, not 0.5" },
          { name: "5 rounds: 5 banded pull-ups / 10 push-ups (full or mixed) / 30 squats", sets: "", note: "Rest 60 sec between rounds" },
          { name: "Note total time", sets: "", note: "You are training the combo, not just the parts" },
        ],
      },
      { id: "p2-sat", day: "Saturday — Rest", hasTime: false, exercises: [] },
    ],
    milestones: [
      { id: "p2-m1", text: "1 unassisted pull-up OR 5 clean banded pull-ups" },
      { id: "p2-m2", text: "10 consecutive full push-ups" },
      { id: "p2-m3", text: "1 mile run under 12:30" },
      { id: "p2-m4", text: "Friday circuit completed in under 35 min" },
    ],
  },
  {
    phase: "03", name: "Build the Volume", weeks: "Weeks 9–10",
    accent: "#4aff9e",
    tagline: "Scale push-ups toward 75. Lock in the combo.",
    pullupFocus: "If you have 3+ unassisted pull-ups, attempt them before the band. Log both numbers.",
    schedule: [
      {
        id: "p3-sun", day: "Sunday — Pull Strength", hasTime: false,
        exercises: [
          { name: "Unassisted pull-ups", sets: "Work up to 3 × max", note: "Even if max is 1–2. Every rep counts.", trackReps: true, repsLabel: "Max unassisted reps (best set)", repsPlaceholder: "e.g. 3" },
          { name: "Banded pull-ups", sets: "3 × 5 after unassisted sets", note: "" },
          { name: "Full push-ups", sets: "5 × 15", note: "Rest 90 sec between sets. Quality over speed.", trackReps: true, repsLabel: "Total full push-ups completed", repsPlaceholder: "e.g. 65" },
        ],
      },
      { id: "p3-mon", day: "Monday — Rest", hasTime: false, exercises: [] },
      {
        id: "p3-tue", day: "Tuesday — Run", hasTime: true,
        exercises: [
          { name: "1 mile easy", sets: "", note: "" },
          { name: "1 mile at goal pace", sets: "Target sub-11:30", note: "Two miles total. Second mile is goal simulation." },
        ],
      },
      {
        id: "p3-wed", day: "Wednesday — Push Volume", hasTime: false,
        exercises: [
          { name: "Push-up density sets", sets: "10 push-ups every 60 sec for 10 min", note: "That's 100 push-ups. Rest the remaining seconds each minute.", trackReps: true, repsLabel: "Total full push-ups completed", repsPlaceholder: "e.g. 80" },
          { name: "Air squats", sets: "2 × 100", note: "Consecutive. Time it." },
        ],
      },
      { id: "p3-thu", day: "Thursday — Volleyball 🏐", hasTime: false, exercises: [] },
      {
        id: "p3-fri", day: "Friday — Full Dress Rehearsal", hasTime: true,
        exercises: [
          { name: "1 mile run", sets: "Target 11:00", note: "" },
          { name: "5 banded pull-ups", sets: "", note: "" },
          { name: "75 push-ups", sets: "Break however needed", note: "Track time for this block" },
          { name: "300 squats", sets: "Break however needed", note: "Track time for this block" },
          { name: "1 mile run", sets: "Go", note: "Note how dead your legs feel. This is the data." },
        ],
      },
      { id: "p3-sat", day: "Saturday — Rest", hasTime: false, exercises: [] },
    ],
    milestones: [
      { id: "p3-m1", text: "Complete dress rehearsal (any time)" },
      { id: "p3-m2", text: "75 push-ups total in under 18 min" },
      { id: "p3-m3", text: "300 squats total in under 12 min" },
      { id: "p3-m4", text: "Both miles run without stopping" },
    ],
  },
  {
    phase: "04", name: "Race Week", weeks: "Weeks 11–12",
    accent: "#ffd84a",
    tagline: "Taper, sharpen, execute.",
    pullupFocus: "Whatever pull-ups you have on race day — use them. This is not the day to ego-lift off the band.",
    schedule: [
      {
        id: "p4-sun", day: "Sunday — Short Sharpener", hasTime: false,
        exercises: [
          { name: "2 × 3 pull-ups (banded or unassisted)", sets: "", note: "Stay fresh. No grinding.", trackReps: true, repsLabel: "Unassisted reps today", repsPlaceholder: "e.g. 5" },
          { name: "3 × 10 full push-ups", sets: "", note: "" },
          { name: "2 × 20 squats", sets: "", note: "" },
        ],
      },
      { id: "p4-mon", day: "Monday — Rest", hasTime: false, exercises: [] },
      {
        id: "p4-tue", day: "Tuesday — Easy Mile", hasTime: true,
        exercises: [
          { name: "1 easy mile", sets: "Conversational pace", note: "Shake out the legs, nothing more" },
        ],
      },
      { id: "p4-wed", day: "Wednesday — Rest", hasTime: false, exercises: [] },
      { id: "p4-thu", day: "Thursday — Volleyball 🏐", hasTime: false, exercises: [] },
      {
        id: "p4-fri", day: "Friday or Saturday — 🏁 RACE DAY", hasTime: true,
        exercises: [
          { name: "1 mile run → 5 pull-ups → 75 push-ups → 300 squats → 1 mile run", sets: "Goal: Sub 60 min", note: "Warm up 10 min beforehand. Start mile 1 conservatively." },
        ],
      },
      { id: "p4-sat", day: "Saturday — Rest / Celebrate", hasTime: false, exercises: [] },
    ],
    milestones: [
      { id: "p4-m1", text: "Complete the full workout" },
      { id: "p4-m2", text: "Finish under 60 minutes" },
    ],
  },
];

// ─── helpers ────────────────────────────────────────────────────────────────

const EMPTY_STATE = { entries: [], milestones: {} };

function currentWeekSunday(d = new Date()) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() - dt.getDay());
  return dt;
}

function weekLabel(sunday) {
  return sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function todayStr() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isInWeek(dateStr, sunday) {
  try {
    const d = new Date(dateStr);
    const sat = new Date(sunday);
    sat.setDate(sat.getDate() + 6);
    sat.setHours(23, 59, 59);
    return d >= sunday && d <= sat;
  } catch { return false; }
}

// ─── component ──────────────────────────────────────────────────────────────

export default function MurphPlan() {
  const [activePhase, setActivePhase] = useState(0);
  const [openDay, setOpenDay] = useState(null);
  const [data, setData] = useState(EMPTY_STATE);
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | saving | error | offline
  const [activeTab, setActiveTab] = useState("plan");
  const [editingEntryId, setEditingEntryId] = useState(null);
  const saveTimerRef = useRef(null);

  // Initial load from Supabase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: row, error } = await supabase
          .from(STATE_TABLE)
          .select("data")
          .eq("user_id", USER_ID)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          console.error("Supabase load failed:", error);
          setSyncStatus("error");
        } else if (row?.data && typeof row.data === "object") {
          setData({
            entries: Array.isArray(row.data.entries) ? row.data.entries : [],
            milestones: row.data.milestones && typeof row.data.milestones === "object" ? row.data.milestones : {},
          });
        }
      } catch (e) {
        console.error("Supabase load threw:", e);
        if (!cancelled) setSyncStatus("error");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Debounced save to Supabase whenever data changes (after initial load)
  useEffect(() => {
    if (!loaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSyncStatus("saving");
    saveTimerRef.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from(STATE_TABLE)
          .upsert(
            { user_id: USER_ID, data, updated_at: new Date().toISOString() },
            { onConflict: "user_id" }
          );
        if (error) {
          console.error("Supabase save failed:", error);
          setSyncStatus("error");
        } else {
          setSyncStatus("idle");
        }
      } catch (e) {
        console.error("Supabase save threw:", e);
        setSyncStatus("error");
      }
    }, 500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [data, loaded]);

  const phase = phases[activePhase];
  const thisWeekSunday = currentWeekSunday();
  const thisWeekLabel = weekLabel(thisWeekSunday);

  // ── data helpers ──────────────────────────────────────────────────────────

  function thisWeekEntries(dayId) {
    return data.entries.filter(e => e.dayId === dayId && isInWeek(e.date, thisWeekSunday));
  }

  function isCheckedThisWeek(dayId) {
    return thisWeekEntries(dayId).length > 0;
  }

  function latestThisWeek(dayId) {
    const arr = thisWeekEntries(dayId);
    return arr.length ? arr[arr.length - 1] : null;
  }

  function toggleWorkout(dayId) {
    if (isCheckedThisWeek(dayId)) {
      setData(prev => ({ ...prev, entries: prev.entries.filter(e => !(e.dayId === dayId && isInWeek(e.date, thisWeekSunday))) }));
    } else {
      const newEntry = {
        id: `${dayId}-${Date.now()}`,
        dayId,
        weekLabel: thisWeekLabel,
        date: todayStr(),
        time: "",
        exStats: {},
      };
      setData(prev => ({ ...prev, entries: [...prev.entries, newEntry] }));
    }
  }

  function updateEntry(entryId, field, value) {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === entryId ? { ...e, [field]: value } : e),
    }));
  }

  function updateEntryExStat(entryId, exIndex, field, value) {
    setData(prev => ({
      ...prev,
      entries: prev.entries.map(e => {
        if (e.id !== entryId) return e;
        return { ...e, exStats: { ...e.exStats, [exIndex]: { ...(e.exStats[exIndex] || {}), [field]: value } } };
      }),
    }));
  }

  function toggleMilestone(id) {
    setData(prev => {
      const updated = { ...prev.milestones };
      if (updated[id]) { delete updated[id]; }
      else { updated[id] = { date: todayStr() }; }
      return { ...prev, milestones: updated };
    });
  }

  function updateMilestoneDate(id, date) {
    setData(prev => ({ ...prev, milestones: { ...prev.milestones, [id]: { ...prev.milestones[id], date } } }));
  }

  function phaseComplete(p) {
    return p.milestones.every(m => data.milestones[m.id]);
  }

  // ── log entries ───────────────────────────────────────────────────────────

  const logEntries = [];
  phases.forEach(p => {
    p.schedule.forEach(d => {
      data.entries.filter(e => e.dayId === d.id).forEach(entry => {
        const trackableExercises = d.exercises.map((ex, ei) => {
          if (!ex.trackReps && !ex.trackHangTime) return null;
          const s = entry.exStats[ei] || {};
          return { exIndex: ei, name: ex.name, trackReps: ex.trackReps, repsLabel: ex.repsLabel, trackHangTime: ex.trackHangTime, reps: s.reps || "", hangTime: s.hangTime || "" };
        }).filter(Boolean);
        const exNotes = trackableExercises.map(ex => {
          const parts = [];
          if (ex.reps !== "") parts.push(`${ex.repsLabel || "Max reps"}: ${ex.reps}`);
          if (ex.hangTime !== "") parts.push(`Hang: ${ex.hangTime}`);
          return parts.length ? `${ex.name} — ${parts.join(", ")}` : null;
        }).filter(Boolean);
        logEntries.push({ type: "workout", entry, day: d.day, phase: p.name, phaseNum: p.phase, accent: p.accent, hasTime: d.hasTime, trackableExercises, exNotes });
      });
    });
    p.milestones.forEach(m => {
      if (data.milestones[m.id]) {
        logEntries.push({ type: "milestone", milestoneId: m.id, day: m.text, phase: p.name, phaseNum: p.phase, accent: p.accent, date: data.milestones[m.id].date });
      }
    });
  });
  logEntries.sort((a, b) => {
    const da = a.type === "workout" ? a.entry.date : a.date;
    const db = b.type === "workout" ? b.entry.date : b.date;
    return new Date(db) - new Date(da);
  });

  // ── stats ─────────────────────────────────────────────────────────────────

  const completedThisPhase = phase.schedule.filter(d => d.exercises.length > 0 && isCheckedThisWeek(d.id)).length;
  const totalWorkoutDays = phase.schedule.filter(d => d.exercises.length > 0).length;
  const completedMilestones = phase.milestones.filter(m => data.milestones[m.id]).length;

  // ── styles ────────────────────────────────────────────────────────────────

  const inputStyle = (accent) => ({
    background: "#0a0f14", border: `1px solid ${accent}40`, borderRadius: 5,
    color: "#e8e0d0", fontSize: 13, padding: "5px 9px", fontFamily: "inherit",
    outline: "none", width: "100%", boxSizing: "border-box",
  });

  const labelStyle = {
    fontSize: 11, color: "#6a8aaa", letterSpacing: "0.08em",
    textTransform: "uppercase", width: 80, flexShrink: 0,
  };

  const syncBadge = (() => {
    if (!loaded) return { text: "Loading…", color: "#8899aa" };
    if (syncStatus === "saving") return { text: "Saving…", color: "#8899aa" };
    if (syncStatus === "error") return { text: "Sync error", color: "#cc6666" };
    return { text: "Synced", color: "#4aff9e" };
  })();

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: "#0a0f14", minHeight: "100vh", fontFamily: "'Georgia', serif", color: "#e8e0d0", paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(180deg, #0f1923 0%, #0a0f14 100%)", borderBottom: "1px solid #1e2d3d", padding: "28px 24px 20px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#4a9eff" }}>12-Week Program</div>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: syncBadge.color }}>{syncBadge.text}</div>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em", color: "#fff" }}>Murph Variation</h1>
          <p style={{ margin: "0 0 20px", color: "#8899aa", fontSize: 14 }}>Track your training. Advance when you're ready.</p>
          <div style={{ background: "#0f1923", border: "1px solid #1e2d3d", borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4a9eff", marginBottom: 12 }}>{TARGET_WORKOUT.subtitle}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {TARGET_WORKOUT.sections.map((s, i) => (
                <div key={i} style={{ background: "#162030", border: "1px solid #1e3048", borderRadius: 6, padding: "8px 10px", flex: "1 1 auto", minWidth: 90 }}>
                  <div style={{ fontSize: 15, marginBottom: 2 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 12 }}>{s.label}</div>
                  <div style={{ color: "#6a8aaa", fontSize: 10, marginTop: 1 }}>{s.detail}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "#4a9eff", borderTop: "1px solid #1e2d3d", paddingTop: 10 }}>→ {TARGET_WORKOUT.finalForm}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", borderBottom: "1px solid #1e2d3d", margin: "20px 0 0" }}>
          {["plan", "log"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: "none", border: "none",
              borderBottom: activeTab === tab ? `2px solid ${phase.accent}` : "2px solid transparent",
              color: activeTab === tab ? "#fff" : "#556677",
              padding: "8px 18px 10px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
              fontFamily: "inherit", marginBottom: -1,
            }}>
              {tab === "plan" ? "Training Plan" : `Activity Log${logEntries.length ? ` (${logEntries.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* ══════════════ PLAN TAB ══════════════ */}
        {activeTab === "plan" && (
          <>
            {/* Phase selector */}
            <div style={{ display: "flex", gap: 8, margin: "20px 0 16px", flexWrap: "wrap" }}>
              {phases.map((p, i) => {
                const done = phaseComplete(p);
                return (
                  <button key={i} onClick={() => { setActivePhase(i); setOpenDay(null); }} style={{
                    background: activePhase === i ? p.accent : "#0f1923",
                    color: activePhase === i ? "#0a0f14" : done ? p.accent : "#8899aa",
                    border: `1px solid ${activePhase === i ? p.accent : done ? p.accent + "60" : "#1e2d3d"}`,
                    borderRadius: 6, padding: "7px 12px", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {done ? "✓ " : ""}{p.phase} · {p.weeks}
                  </button>
                );
              })}
            </div>

            {/* Phase header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 3 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: phase.accent, letterSpacing: "-0.03em" }}>{phase.phase}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{phase.name}</span>
              </div>
              <p style={{ margin: "0 0 6px", color: "#8899aa", fontSize: 13 }}>{phase.tagline}</p>

              {/* Current week banner */}
              <div style={{ fontSize: 12, color: phase.accent, marginBottom: 6 }}>
                Week of {thisWeekLabel} · {completedThisPhase}/{totalWorkoutDays} workouts this week
              </div>

              <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#8899aa", marginBottom: 6 }}>
                <span>{completedMilestones}/{phase.milestones.length} milestones</span>
              </div>
              <div style={{ height: 4, background: "#1e2d3d", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(completedMilestones / phase.milestones.length) * 100}%`, background: phase.accent, borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            </div>

            {/* Pull-up callout */}
            <div style={{ background: "#0f1923", borderLeft: `3px solid ${phase.accent}`, borderRadius: "0 6px 6px 0", padding: "9px 12px", marginBottom: 18, fontSize: 13, color: "#b8c8d8" }}>
              <span style={{ color: phase.accent, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Pull-up Watch · </span>
              {phase.pullupFocus}
            </div>

            {/* Schedule */}
            <div style={{ marginBottom: 20 }}>
              {phase.schedule.map((day, di) => {
                const key = `${activePhase}-${di}`;
                const isOpen = openDay === key;
                const hasContent = day.exercises.length > 0;
                const isVolleyball = day.day.includes("Volleyball");
                const isRest = !hasContent && !isVolleyball;
                const checked = isCheckedThisWeek(day.id);
                const latest = latestThisWeek(day.id);
                const allEntries = data.entries.filter(e => e.dayId === day.id);
                const prevCount = allEntries.length - (checked ? 1 : 0);

                return (
                  <div key={di} style={{ marginBottom: 7 }}>
                    <div style={{
                      background: isOpen ? "#162030" : "#0f1923",
                      border: `1px solid ${isOpen ? phase.accent + "50" : checked ? phase.accent + "40" : "#1e2d3d"}`,
                      borderRadius: isOpen ? "8px 8px 0 0" : 8,
                      padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      {hasContent && (
                        <button onClick={() => toggleWorkout(day.id)} style={{
                          width: 22, height: 22, borderRadius: 5,
                          border: `2px solid ${checked ? phase.accent : "#334455"}`,
                          background: checked ? phase.accent : "transparent",
                          cursor: "pointer", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                        }}>
                          {checked && <span style={{ color: "#0a0f14", fontSize: 13, fontWeight: 900 }}>✓</span>}
                        </button>
                      )}
                      <button onClick={() => hasContent && setOpenDay(isOpen ? null : key)} style={{
                        background: "none", border: "none", cursor: hasContent ? "pointer" : "default",
                        textAlign: "left", flex: 1, padding: 0, fontFamily: "inherit",
                      }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: isRest ? "#3a4a5a" : isVolleyball ? "#8899aa" : "#e8e0d0" }}>
                            {day.day}
                          </span>
                          {checked && latest?.date && (
                            <span style={{ fontSize: 11, color: phase.accent }}>
                              logged {latest.date}{latest.time ? ` · ${latest.time}` : ""}
                            </span>
                          )}
                          {prevCount > 0 && (
                            <span style={{ fontSize: 10, color: "#5a7a9a", background: "#162030", borderRadius: 4, padding: "1px 6px" }}>
                              {prevCount} prior {prevCount === 1 ? "week" : "weeks"}
                            </span>
                          )}
                        </div>
                      </button>
                      {hasContent && <span style={{ color: phase.accent, fontSize: 14, flexShrink: 0 }}>{isOpen ? "−" : "+"}</span>}
                    </div>

                    {isOpen && (
                      <div style={{ background: "#0d1820", border: `1px solid ${phase.accent}30`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "4px 0 12px" }}>
                        {day.exercises.map((ex, ei) => {
                          const stat = latest?.exStats?.[ei] || {};
                          return (
                            <div key={ei} style={{ padding: "10px 16px", borderBottom: ei < day.exercises.length - 1 ? "1px solid #1a2530" : "none" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: (ex.trackReps || ex.trackHangTime) ? 8 : 0 }}>
                                <span style={{ fontSize: 13, color: "#d8d0c0", fontWeight: 600, flex: 1 }}>{ex.name}</span>
                                {ex.sets && (
                                  <span style={{ fontSize: 11, color: phase.accent, background: phase.accent + "15", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0 }}>{ex.sets}</span>
                                )}
                              </div>
                              {ex.note && <div style={{ fontSize: 11, color: "#5a7a9a", marginBottom: (ex.trackReps || ex.trackHangTime) ? 8 : 0, lineHeight: 1.5 }}>{ex.note}</div>}
                              {ex.trackReps && (
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: ex.trackHangTime ? 6 : 0 }}>
                                  <label style={labelStyle}>{ex.repsLabel || "Max reps"}</label>
                                  <input type="text" placeholder={ex.repsPlaceholder || "e.g. 8"} value={stat.reps || ""}
                                    onChange={ev => {
                                      const entry = latestThisWeek(day.id);
                                      if (entry) updateEntryExStat(entry.id, ei, "reps", ev.target.value);
                                      else {
                                        const newEntry = { id: `${day.id}-${Date.now()}`, dayId: day.id, weekLabel: thisWeekLabel, date: todayStr(), time: "", exStats: { [ei]: { reps: ev.target.value } } };
                                        setData(prev => ({ ...prev, entries: [...prev.entries, newEntry] }));
                                      }
                                    }}
                                    style={{ ...inputStyle(phase.accent), maxWidth: 140 }} />
                                </div>
                              )}
                              {ex.trackHangTime && (
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <label style={labelStyle}>Best hang</label>
                                  <input type="text" placeholder={ex.hangPlaceholder || "e.g. 18 sec"} value={stat.hangTime || ""}
                                    onChange={ev => {
                                      const entry = latestThisWeek(day.id);
                                      if (entry) updateEntryExStat(entry.id, ei, "hangTime", ev.target.value);
                                      else {
                                        const newEntry = { id: `${day.id}-${Date.now()}`, dayId: day.id, weekLabel: thisWeekLabel, date: todayStr(), time: "", exStats: { [ei]: { hangTime: ev.target.value } } };
                                        setData(prev => ({ ...prev, entries: [...prev.entries, newEntry] }));
                                      }
                                    }}
                                    style={{ ...inputStyle(phase.accent), maxWidth: 140 }} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {day.hasTime && (
                          <div style={{ padding: "10px 16px 2px", borderTop: "1px solid #1a2530", marginTop: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <label style={labelStyle}>Record time</label>
                              <input type="text" placeholder="e.g. 11:42" value={latest?.time || ""}
                                onChange={ev => {
                                  const entry = latestThisWeek(day.id);
                                  if (entry) updateEntry(entry.id, "time", ev.target.value);
                                  else {
                                    const newEntry = { id: `${day.id}-${Date.now()}`, dayId: day.id, weekLabel: thisWeekLabel, date: todayStr(), time: ev.target.value, exStats: {} };
                                    setData(prev => ({ ...prev, entries: [...prev.entries, newEntry] }));
                                  }
                                }}
                                style={{ ...inputStyle(phase.accent), maxWidth: 200 }} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Milestones */}
            <div style={{ background: "#0f1923", border: `1px solid ${phase.accent}30`, borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: phase.accent, fontWeight: 700, marginBottom: 12 }}>
                Phase Gates — check off when achieved
              </div>
              {phase.milestones.map((m, mi) => {
                const done = !!data.milestones[m.id];
                return (
                  <div key={mi} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: mi < phase.milestones.length - 1 ? "1px solid #1a2530" : "none" }}>
                    <button onClick={() => toggleMilestone(m.id)} style={{
                      width: 20, height: 20, borderRadius: 4,
                      border: `2px solid ${done ? phase.accent : "#334455"}`,
                      background: done ? phase.accent : "transparent",
                      cursor: "pointer", flexShrink: 0, marginTop: 1,
                      display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
                    }}>
                      {done && <span style={{ color: "#0a0f14", fontSize: 11, fontWeight: 900 }}>✓</span>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, color: done ? phase.accent : "#c8c0b0", textDecoration: done ? "line-through" : "none" }}>{m.text}</span>
                      {done && data.milestones[m.id]?.date && (
                        <span style={{ fontSize: 11, color: "#5a7a9a", marginLeft: 8 }}>achieved {data.milestones[m.id].date}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Level up */}
            {phaseComplete(phase) && activePhase < phases.length - 1 && (
              <button onClick={() => { setActivePhase(activePhase + 1); setOpenDay(null); }} style={{
                width: "100%", background: phase.accent, color: "#0a0f14", border: "none", borderRadius: 8,
                padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", letterSpacing: "0.05em", marginBottom: 20,
              }}>
                All gates cleared — advance to Phase {String(activePhase + 2).padStart(2, "0")} →
              </button>
            )}
          </>
        )}

        {/* ══════════════ LOG TAB ══════════════ */}
        {activeTab === "log" && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8899aa", marginBottom: 16 }}>
              {logEntries.length} {logEntries.length === 1 ? "entry" : "entries"} recorded
            </div>

            {logEntries.length === 0 ? (
              <div style={{ color: "#3a4a5a", fontSize: 14, padding: "40px 0", textAlign: "center" }}>
                No workouts logged yet. Check off your first session to start.
              </div>
            ) : (
              logEntries.map((e, i) => {
                const uid = e.type === "workout" ? e.entry.id : e.milestoneId;
                const isEditing = editingEntryId === uid;

                return (
                  <div key={i} style={{
                    background: "#0f1923",
                    border: `1px solid ${isEditing ? e.accent + "80" : e.accent + "25"}`,
                    borderRadius: 7, padding: "11px 14px", marginBottom: 7,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "#d8d0c0", fontWeight: 600, marginBottom: 2 }}>
                          {e.day.replace(/[🏐🏁]/g, "").trim()}
                        </div>
                        <div style={{ fontSize: 11, color: "#5a7a9a" }}>
                          Phase {e.phaseNum} · {e.phase}
                          {e.type === "workout" && e.entry.weekLabel && (
                            <span style={{ marginLeft: 6, color: "#3a5a7a" }}>· week of {e.entry.weekLabel}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {!isEditing && (
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 12, color: e.accent }}>
                              {e.type === "workout" ? e.entry.date : e.date}
                            </div>
                            {e.type === "workout" && e.entry.time && (
                              <div style={{ fontSize: 12, color: "#8899aa", marginTop: 1 }}>{e.entry.time}</div>
                            )}
                            {e.type === "milestone" && (
                              <div style={{ fontSize: 10, color: e.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 1 }}>Milestone</div>
                            )}
                          </div>
                        )}
                        <button onClick={() => setEditingEntryId(isEditing ? null : uid)} style={{
                          background: isEditing ? e.accent : "transparent",
                          border: `1px solid ${isEditing ? e.accent : "#2a3a4a"}`,
                          borderRadius: 5, padding: "4px 9px", cursor: "pointer",
                          fontSize: 11, color: isEditing ? "#0a0f14" : "#6a8aaa",
                          fontFamily: "inherit", fontWeight: 700, letterSpacing: "0.05em",
                        }}>
                          {isEditing ? "Done" : "Edit"}
                        </button>
                      </div>
                    </div>

                    {!isEditing && e.type === "workout" && e.exNotes.length > 0 && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1a2530" }}>
                        {e.exNotes.map((n, ni) => (
                          <div key={ni} style={{ fontSize: 12, color: "#6a8aaa", marginBottom: 2 }}>{n}</div>
                        ))}
                      </div>
                    )}

                    {isEditing && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a2530", display: "flex", flexDirection: "column", gap: 10 }}>

                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <label style={labelStyle}>Date</label>
                          <input type="text"
                            value={e.type === "workout" ? e.entry.date : e.date}
                            onChange={ev => {
                              if (e.type === "workout") updateEntry(e.entry.id, "date", ev.target.value);
                              else updateMilestoneDate(e.milestoneId, ev.target.value);
                            }}
                            placeholder="e.g. Jun 7, 2026"
                            style={{ ...inputStyle(e.accent), maxWidth: 200 }} />
                        </div>

                        {e.type === "workout" && e.hasTime && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <label style={labelStyle}>Time</label>
                            <input type="text"
                              value={e.entry.time || ""}
                              onChange={ev => updateEntry(e.entry.id, "time", ev.target.value)}
                              placeholder="e.g. 11:42"
                              style={{ ...inputStyle(e.accent), maxWidth: 200 }} />
                          </div>
                        )}

                        {e.type === "workout" && e.trackableExercises.map((ex, xi) => {
                          const s = e.entry.exStats[ex.exIndex] || {};
                          return (
                            <div key={xi} style={{ paddingTop: 8, borderTop: "1px solid #1a2530" }}>
                              <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 8, fontStyle: "italic" }}>{ex.name}</div>
                              {ex.trackReps && (
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ex.trackHangTime ? 8 : 0 }}>
                                  <label style={{ ...labelStyle, width: 90 }}>{ex.repsLabel ? ex.repsLabel.split(" ").slice(0, 2).join(" ") : "Max reps"}</label>
                                  <input type="text" value={s.reps || ""}
                                    onChange={ev => updateEntryExStat(e.entry.id, ex.exIndex, "reps", ev.target.value)}
                                    placeholder="e.g. 8"
                                    style={{ ...inputStyle(e.accent), maxWidth: 120 }} />
                                </div>
                              )}
                              {ex.trackHangTime && (
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <label style={{ ...labelStyle, width: 90 }}>Hang time</label>
                                  <input type="text" value={s.hangTime || ""}
                                    onChange={ev => updateEntryExStat(e.entry.id, ex.exIndex, "hangTime", ev.target.value)}
                                    placeholder="e.g. 22 sec"
                                    style={{ ...inputStyle(e.accent), maxWidth: 120 }} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}
