import { useState, useEffect, useRef } from "react";
import { supabase, USER_ID, STATE_TABLE } from "./supabaseClient";

const TARGET_WORKOUT = {
  subtitle: "The Trial · Goal: Sub 60 min",
  sections: [
    { label: "Mile 1", detail: "Target 11:00", icon: "🏃" },
    { label: "5 Pull-ups", detail: "Banded · ~2 min", icon: "💪" },
    { label: "75 Push-ups", detail: "Full · ~15 min", icon: "⬇️" },
    { label: "300 Squats", detail: "Air · ~12 min", icon: "🦵" },
    { label: "Mile 2", detail: "Target 13:00", icon: "🏃" },
  ],
  finalForm: "Full Discipline (Month 6+): 1mi → 10 pull-ups → 200 push-ups → 300 squats → 1mi · Sub 60 min",
};

// ─── core workouts ──────────────────────────────────────────────────────────
// Every exercise gets a completion checkbox. trackReps / trackWeight add inputs.

const WARMUP = { name: "Warm-up run", sets: "0.5 mile", note: "Easy pace. Loosen the legs." };
const SWORD_FLOW = { name: "Sword flow", sets: "20 min", note: "Forms and blade drills. Let precision matter more than sweat." };

function bladeTraining(id, { pullup, rows, pushups }) {
  return {
    id, day: "Monday — Blade Training", hasTime: false,
    exercises: [
      WARMUP,
      { trackReps: true, repsLabel: "Best set (reps)", repsPlaceholder: "e.g. 4", ...pullup },
      rows,
      pushups,
      { name: "Goblet squats", sets: "3 × 10", note: "Add weight when all 3 sets feel clean.", trackWeight: true },
      { name: "Farmer carry", sets: "3 × 30 sec", note: "Tall posture, tight grip.", trackWeight: true },
      SWORD_FLOW,
    ],
  };
}

function shadowStealth(id, { intervals, circuit }) {
  return {
    id, day: "Wednesday — Shadow Stealth", hasTime: false,
    exercises: [
      WARMUP,
      { name: "Run intervals: 1 min hard / 1 min easy", sets: intervals, note: "Hard: you can't hold a conversation. Easy: you can." },
      { name: circuit, sets: "3 rounds", note: "" },
      SWORD_FLOW,
    ],
  };
}

function ironDiscipline(id, rdlNote = "Hinge at the hips, soft knees, flat back. Add weight when all 4 sets feel clean.") {
  return {
    id, day: "Thursday — Iron Discipline", hasTime: false,
    exercises: [
      WARMUP,
      { name: "Romanian deadlift", sets: "4 × 8", note: rdlNote, trackWeight: true },
      { name: "Reverse or walking lunges", sets: "3 × 10 per leg", note: "", trackWeight: true },
      { name: "Hip thrust", sets: "3 × 8", note: "Squeeze and pause at the top.", trackWeight: true },
      { name: "Suitcase carry", sets: "3 × 30 sec", note: "Weight in one hand. Don't lean.", trackWeight: true },
      { name: "Dead bugs", sets: "3 × 10", note: "Low back stays pressed into the floor." },
      SWORD_FLOW,
    ],
  };
}

const phases = [
  {
    phase: "I", name: "Initiate — The Unmarked", weeks: "Weeks 1–4",
    accent: "#4a9eff",
    tagline: "The Unmarked train in secret, before dawn. Build movement quality and your cardio base.",
    pullupFocus: "Negatives build the strength for your first pull-up. Log your best set every Monday. Slow and controlled beats more reps.",
    schedule: [
      bladeTraining("r1-mon", {
        pullup: { name: "Negative pull-ups", sets: "4 × 3–5", note: "Jump to the bar, take 5 full seconds to lower." },
        rows: { name: "Inverted rows", sets: "3 × 8", note: "Body straight, pull your chest to the bar." },
        pushups: { name: "Knee push-ups", sets: "4 × 12", note: "Full range — chest touches the floor every rep." },
      }),
      shadowStealth("r1-wed", { intervals: "6 rounds", circuit: "10 air squats / 5 knee push-ups / 30 sec plank" }),
      ironDiscipline("r1-thu"),
    ],
    milestones: [
      { id: "r1-m1", text: "5 controlled negatives (5 sec each) in one set" },
      { id: "r1-m2", text: "20 consecutive knee push-ups" },
      { id: "r1-m3", text: "6 interval rounds without walking the hard minutes" },
      { id: "r1-m4", text: "All 3 core days completed in one week" },
    ],
  },
  {
    phase: "II", name: "Blade Apprentice — First Steel", weeks: "Weeks 5–8",
    accent: "#ff7c4a",
    tagline: "You've earned your first practice blade. Banded pull-ups and incline push-ups.",
    pullupFocus: "Use the heaviest band you need for clean reps. When 5 feels easy, you're ready for a lighter band.",
    schedule: [
      bladeTraining("r2-mon", {
        pullup: { name: "Band-assisted pull-ups", sets: "4 × 3–5", note: "Heavy band. Full hang at the bottom, chin over the bar at the top." },
        rows: { name: "Inverted rows", sets: "3 × 10", note: "Body straight, pull your chest to the bar." },
        pushups: { name: "Incline push-ups", sets: "4 × 10", note: "Bench or countertop. Lower the incline as they get easier." },
      }),
      shadowStealth("r2-wed", { intervals: "7 rounds", circuit: "15 air squats / 5 incline push-ups / 30 sec plank" }),
      ironDiscipline("r2-thu"),
    ],
    milestones: [
      { id: "r2-m1", text: "5 band-assisted pull-ups in one set" },
      { id: "r2-m2", text: "10 consecutive full push-ups" },
      { id: "r2-m3", text: "7 interval rounds without walking the hard minutes" },
      { id: "r2-m4", text: "Romanian deadlift weight up from your Rank I start" },
    ],
  },
  {
    phase: "III", name: "Shadow Adept — The Climb", weeks: "Weeks 9–10",
    accent: "#4aff9e",
    tagline: "Adepts train the climb. Lighter band, full push-ups, longer intervals.",
    pullupFocus: "Lighter band or more reps — pick one and log it. Try one unassisted rep at the end of each session.",
    schedule: [
      bladeTraining("r3-mon", {
        pullup: { name: "Band-assisted pull-ups (lighter band)", sets: "4 × 5", note: "Or stay on the same band for 4 × 8." },
        rows: { name: "Inverted rows", sets: "3 × 12", note: "Body straight, pull your chest to the bar." },
        pushups: { name: "Full push-ups", sets: "4 × 8", note: "Chest to the floor, body in one line." },
      }),
      shadowStealth("r3-wed", { intervals: "8 rounds", circuit: "20 air squats / 5 full push-ups / 45 sec plank" }),
      ironDiscipline("r3-thu"),
    ],
    milestones: [
      { id: "r3-m1", text: "5 pull-ups on the lighter band in one set" },
      { id: "r3-m2", text: "20 consecutive full push-ups" },
      { id: "r3-m3", text: "8 interval rounds without walking the hard minutes" },
      { id: "r3-m4", text: "Run 1 mile without stopping" },
    ],
  },
  {
    phase: "IV", name: "Silent Blade — Full Discipline", weeks: "Weeks 11–12",
    accent: "#ffd84a",
    tagline: "Full pull-ups, sharpened conditioning. The Trial awaits when you're ready.",
    pullupFocus: "Full pull-ups now. Log whatever you get, then finish with the band. Take the Trial when you're ready.",
    schedule: [
      bladeTraining("r4-mon", {
        pullup: { name: "Full pull-ups", sets: "4 × max", note: "Finish each set with banded reps if needed.", repsLabel: "Best set (unassisted)", repsPlaceholder: "e.g. 2" },
        rows: { name: "Inverted rows (feet elevated)", sets: "3 × 8", note: "Feet on a bench or chair." },
        pushups: { name: "Full push-ups", sets: "4 × 12", note: "Chest to the floor, body in one line." },
      }),
      shadowStealth("r4-wed", { intervals: "6 rounds", circuit: "20 air squats / 8 full push-ups / 45 sec plank" }),
      ironDiscipline("r4-thu", "Keep the weight steady. In the week you take the Trial, go about 20% lighter."),
    ],
    milestones: [
      { id: "r4-m1", text: "1 full unassisted pull-up" },
      { id: "r4-m2", text: "Complete the Trial in full" },
      { id: "r4-m3", text: "Finish the Trial under 60 minutes — you are Umbral Assassin" },
    ],
  },
];

// ─── optional sessions ──────────────────────────────────────────────────────

const OPTIONAL_TARGET = 2;
const OPTIONAL_SESSIONS = [
  { id: "opt-long-patrol", name: "Long Patrol", detail: "30–45 min easy jog or ruck walk" },
  { id: "opt-shadow-work", name: "Shadow Work", detail: "20 min mobility: hips, thoracic spine, shoulders" },
  { id: "opt-weapon-up", name: "Weapon Up class", detail: "Class session" },
];
const OPTIONAL_IDS = new Set(OPTIONAL_SESSIONS.map(s => s.id));

const TRIAL_PHASE = 3;
const TRIAL = {
  id: "trial", name: "The Trial",
  detail: "1 mile → 5 pull-ups → 75 push-ups → 300 squats → 1 mile · Goal: sub 60 min",
  note: "Warm up 10 min first and start mile 1 conservatively. The Order is watching.",
};

// Days from the original Murph program, kept so older log entries still display.
const LEGACY_DAYS = [
  {
    id: "p1-sun", day: "Sunday — Push + Pull", hasTime: false,
    exercises: [
      { name: "Australian pull-ups", trackReps: true, repsLabel: "Max reps (best set)" },
      { name: "Negative pull-ups" },
      { name: "Knee push-ups" },
      { name: "Dead hang", trackHangTime: true },
    ],
  },
  { id: "p1-tue", day: "Tuesday — Run", hasTime: true, exercises: [] },
  { id: "p1-wed", day: "Wednesday — Squat + Core", hasTime: false, exercises: [] },
  { id: "p1-fri", day: "Friday — Combo Circuit", hasTime: true, exercises: [] },
];

// dayId → how an entry for that day is described and tracked
const DAY_INDEX = {};
phases.forEach(p => p.schedule.forEach(d => {
  DAY_INDEX[d.id] = { def: d, group: `Rank ${p.phase} · ${p.name}`, accent: p.accent };
}));
OPTIONAL_SESSIONS.forEach(s => {
  DAY_INDEX[s.id] = { def: { id: s.id, day: s.name, hasTime: false, exercises: [] }, group: "Optional session", accent: "#8899aa" };
});
DAY_INDEX[TRIAL.id] = {
  def: { id: TRIAL.id, day: TRIAL.name, hasTime: true, exercises: [] },
  group: `Rank ${phases[TRIAL_PHASE].phase} · ${phases[TRIAL_PHASE].name}`, accent: phases[TRIAL_PHASE].accent,
};
LEGACY_DAYS.forEach(d => {
  DAY_INDEX[d.id] = { def: d, group: "Old program · Build the Base", accent: "#5a7a9a", legacy: true };
});

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

// ─── styles ─────────────────────────────────────────────────────────────────

const inputStyle = (accent) => ({
  background: "#0a0f14", border: `1px solid ${accent}40`, borderRadius: 5,
  color: "#e8e0d0", fontSize: 13, padding: "5px 9px", fontFamily: "inherit",
  outline: "none", width: "100%", boxSizing: "border-box",
});

const labelStyle = {
  fontSize: 11, color: "#6a8aaa", letterSpacing: "0.08em",
  textTransform: "uppercase", width: 80, flexShrink: 0,
};

const checkboxStyle = (checked, accent, size) => ({
  width: size, height: size, borderRadius: size > 20 ? 5 : 4,
  border: `2px solid ${checked ? accent : "#334455"}`,
  background: checked ? accent : "transparent",
  cursor: "pointer", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
});

function Checkbox({ checked, accent, size = 20, onClick }) {
  return (
    <button onClick={onClick} style={checkboxStyle(checked, accent, size)}>
      {checked && <span style={{ color: "#0a0f14", fontSize: size > 20 ? 13 : 11, fontWeight: 900 }}>✓</span>}
    </button>
  );
}

// One exercise: completion checkbox plus any reps / weight / hang inputs.
function ExerciseTracker({ ex, stat, accent, checkable, onChange }) {
  const hasInputs = ex.trackReps || ex.trackWeight || ex.trackHangTime;
  const field = (label, key, placeholder) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
      <label style={labelStyle}>{label}</label>
      <input type="text" placeholder={placeholder} value={stat[key] || ""}
        onChange={ev => onChange(key, ev.target.value)}
        style={{ ...inputStyle(accent), maxWidth: 140 }} />
    </div>
  );
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        {checkable && <Checkbox checked={!!stat.done} accent={accent} size={18} onClick={() => onChange("done", !stat.done)} />}
        <span style={{ fontSize: 13, color: stat.done ? accent : "#d8d0c0", fontWeight: 600, flex: 1 }}>{ex.name}</span>
        {ex.sets && (
          <span style={{ fontSize: 11, color: accent, background: accent + "15", padding: "2px 7px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0 }}>{ex.sets}</span>
        )}
      </div>
      {ex.note && <div style={{ fontSize: 11, color: "#5a7a9a", marginTop: 4, marginLeft: checkable ? 28 : 0, lineHeight: 1.5 }}>{ex.note}</div>}
      {hasInputs && (
        <div style={{ marginLeft: checkable ? 28 : 0 }}>
          {ex.trackReps && field(ex.repsLabel || "Max reps", "reps", ex.repsPlaceholder || "e.g. 8")}
          {ex.trackWeight && field("Weight", "weight", "e.g. 25 lb")}
          {ex.trackHangTime && field("Best hang", "hangTime", "e.g. 18 sec")}
        </div>
      )}
    </div>
  );
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

  function addEntry(dayId, fields = {}) {
    const newEntry = { id: `${dayId}-${Date.now()}`, dayId, weekLabel: thisWeekLabel, date: todayStr(), time: "", exStats: {}, ...fields };
    setData(prev => ({ ...prev, entries: [...prev.entries, newEntry] }));
  }

  function removeEntry(entryId) {
    setData(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== entryId) }));
  }

  function toggleWorkout(dayId) {
    if (isCheckedThisWeek(dayId)) {
      setData(prev => ({ ...prev, entries: prev.entries.filter(e => !(e.dayId === dayId && isInWeek(e.date, thisWeekSunday))) }));
    } else {
      addEntry(dayId);
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

  // Tracking any part of a day logs it for this week.
  function setDayExStat(dayId, exIndex, field, value) {
    const entry = latestThisWeek(dayId);
    if (entry) updateEntryExStat(entry.id, exIndex, field, value);
    else addEntry(dayId, { exStats: { [exIndex]: { [field]: value } } });
  }

  function setDayTime(dayId, value) {
    const entry = latestThisWeek(dayId);
    if (entry) updateEntry(entry.id, "time", value);
    else addEntry(dayId, { time: value });
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
  data.entries.forEach(entry => {
    const info = DAY_INDEX[entry.dayId];
    if (!info) return;
    const exercises = info.def.exercises;
    const stats = entry.exStats || {};
    const doneCount = exercises.filter((_, ei) => stats[ei]?.done).length;
    const exNotes = exercises.map((ex, ei) => {
      const s = stats[ei] || {};
      const parts = [];
      if (ex.trackReps && s.reps) parts.push(`${ex.repsLabel || "Max reps"}: ${s.reps}`);
      if (ex.trackWeight && s.weight) parts.push(`Weight: ${s.weight}`);
      if (ex.trackHangTime && s.hangTime) parts.push(`Hang: ${s.hangTime}`);
      return parts.length ? `${ex.name} — ${parts.join(", ")}` : null;
    }).filter(Boolean);
    logEntries.push({ type: "workout", uid: entry.id, entry, info, label: info.def.day, group: info.group, accent: info.accent, date: entry.date, doneCount, exNotes });
  });
  phases.forEach(p => {
    p.milestones.forEach(m => {
      if (data.milestones[m.id]) {
        logEntries.push({ type: "milestone", uid: m.id, milestoneId: m.id, label: m.text, group: `Rank ${p.phase} · ${p.name}`, accent: p.accent, date: data.milestones[m.id].date });
      }
    });
  });
  logEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

  // ── stats ─────────────────────────────────────────────────────────────────

  const completedThisPhase = phase.schedule.filter(d => isCheckedThisWeek(d.id)).length;
  const completedMilestones = phase.milestones.filter(m => data.milestones[m.id]).length;
  const optionalThisWeek = data.entries.filter(e => OPTIONAL_IDS.has(e.dayId) && isInWeek(e.date, thisWeekSunday));
  const trialEntries = data.entries.filter(e => e.dayId === TRIAL.id);
  const latestTrial = trialEntries.length ? trialEntries[trialEntries.length - 1] : null;

  const syncBadge = (() => {
    if (!loaded) return { text: "Loading…", color: "#8899aa" };
    if (syncStatus === "saving") return { text: "Saving…", color: "#8899aa" };
    if (syncStatus === "error") return { text: "Sync error", color: "#cc6666" };
    return { text: "Synced", color: "#4aff9e" };
  })();

  const smallButton = (accent) => ({
    background: "transparent", border: `1px solid ${accent}60`, borderRadius: 5,
    padding: "4px 10px", cursor: "pointer", fontSize: 11, color: accent,
    fontFamily: "inherit", fontWeight: 700, letterSpacing: "0.05em", flexShrink: 0,
  });

  const sectionHeading = (accent) => ({
    fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: accent, fontWeight: 700, marginBottom: 12,
  });

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: "#0a0f14", minHeight: "100vh", fontFamily: "'Georgia', serif", color: "#e8e0d0", paddingBottom: 60 }}>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(180deg, #0f1923 0%, #0a0f14 100%)", borderBottom: "1px solid #1e2d3d", padding: "28px 24px 20px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#4a9eff" }}>12-Week Ascension</div>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: syncBadge.color }}>{syncBadge.text}</div>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em", color: "#fff" }}>The Umbral Order</h1>
          <p style={{ margin: "0 0 20px", color: "#8899aa", fontSize: 14 }}>Rise through the ranks. Advance when you're ready.</p>
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
              {tab === "plan" ? "The Path" : `Guild Log${logEntries.length ? ` (${logEntries.length})` : ""}`}
            </button>
          ))}
        </div>

        {/* ══════════════ PLAN TAB ══════════════ */}
        {activeTab === "plan" && (
          <>
            {/* Rank selector */}
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

            {/* Rank header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 3 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: phase.accent, letterSpacing: "-0.03em" }}>{phase.phase}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{phase.name}</span>
              </div>
              <p style={{ margin: "0 0 6px", color: "#8899aa", fontSize: 13 }}>{phase.tagline}</p>

              {/* Current week banner */}
              <div style={{ fontSize: 12, color: phase.accent, marginBottom: 6 }}>
                Week of {thisWeekLabel} · {completedThisPhase}/{phase.schedule.length} core · {optionalThisWeek.length}/{OPTIONAL_TARGET} optional
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
              <span style={{ color: phase.accent, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Guildmaster's Watch · </span>
              {phase.pullupFocus}
            </div>

            {/* Core schedule */}
            <div style={{ marginBottom: 20 }}>
              {phase.schedule.map((day, di) => {
                const key = `${activePhase}-${di}`;
                const isOpen = openDay === key;
                const checked = isCheckedThisWeek(day.id);
                const latest = latestThisWeek(day.id);
                const allEntries = data.entries.filter(e => e.dayId === day.id);
                const prevCount = allEntries.length - (checked ? 1 : 0);
                const doneCount = day.exercises.filter((_, ei) => latest?.exStats?.[ei]?.done).length;

                return (
                  <div key={di} style={{ marginBottom: 7 }}>
                    <div style={{
                      background: isOpen ? "#162030" : "#0f1923",
                      border: `1px solid ${isOpen ? phase.accent + "50" : checked ? phase.accent + "40" : "#1e2d3d"}`,
                      borderRadius: isOpen ? "8px 8px 0 0" : 8,
                      padding: "10px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <Checkbox checked={checked} accent={phase.accent} size={22} onClick={() => toggleWorkout(day.id)} />
                      <button onClick={() => setOpenDay(isOpen ? null : key)} style={{
                        background: "none", border: "none", cursor: "pointer",
                        textAlign: "left", flex: 1, padding: 0, fontFamily: "inherit",
                      }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#e8e0d0" }}>
                            {day.day}
                          </span>
                          {checked && latest?.date && (
                            <span style={{ fontSize: 11, color: phase.accent }}>
                              logged {latest.date} · {doneCount}/{day.exercises.length} done
                            </span>
                          )}
                          {prevCount > 0 && (
                            <span style={{ fontSize: 10, color: "#5a7a9a", background: "#162030", borderRadius: 4, padding: "1px 6px" }}>
                              {prevCount} prior {prevCount === 1 ? "week" : "weeks"}
                            </span>
                          )}
                        </div>
                      </button>
                      <span style={{ color: phase.accent, fontSize: 14, flexShrink: 0 }}>{isOpen ? "−" : "+"}</span>
                    </div>

                    {isOpen && (
                      <div style={{ background: "#0d1820", border: `1px solid ${phase.accent}30`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "4px 0 12px" }}>
                        {day.exercises.map((ex, ei) => (
                          <div key={ei} style={{ padding: "10px 16px", borderBottom: ei < day.exercises.length - 1 ? "1px solid #1a2530" : "none" }}>
                            <ExerciseTracker ex={ex} stat={latest?.exStats?.[ei] || {}} accent={phase.accent} checkable
                              onChange={(field, value) => setDayExStat(day.id, ei, field, value)} />
                          </div>
                        ))}
                        {day.hasTime && (
                          <div style={{ padding: "10px 16px 2px", borderTop: "1px solid #1a2530", marginTop: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <label style={labelStyle}>Record time</label>
                              <input type="text" placeholder="e.g. 11:42" value={latest?.time || ""}
                                onChange={ev => setDayTime(day.id, ev.target.value)}
                                style={{ ...inputStyle(phase.accent), maxWidth: 200 }} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ fontSize: 12, color: "#5a7a9a", padding: "4px 2px" }}>
                Tue · Fri · Sat · Sun — rest, or take an optional session.
              </div>
            </div>

            {/* Optional sessions */}
            <div style={{ background: "#0f1923", border: "1px solid #1e2d3d", borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
              <div style={sectionHeading(phase.accent)}>
                Optional Sessions · {optionalThisWeek.length}/{OPTIONAL_TARGET} this week
              </div>
              {OPTIONAL_SESSIONS.map((s, si) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: si < OPTIONAL_SESSIONS.length - 1 ? "1px solid #1a2530" : "none" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#d8d0c0", fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "#5a7a9a", marginTop: 2 }}>{s.detail}</div>
                  </div>
                  <button onClick={() => addEntry(s.id)} style={smallButton(phase.accent)}>+ Log today</button>
                </div>
              ))}
              {optionalThisWeek.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a2530" }}>
                  {optionalThisWeek.map(e => (
                    <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: phase.accent, padding: "3px 0" }}>
                      <span style={{ flex: 1 }}>✓ {DAY_INDEX[e.dayId].def.day} · {e.date}</span>
                      <button onClick={() => removeEntry(e.id)} aria-label="Remove" style={{ ...smallButton("#6a8aaa"), padding: "1px 8px" }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* The Trial — Rank IV only, taken when ready */}
            {activePhase === TRIAL_PHASE && (
              <div style={{ background: phase.accent + "10", border: `1px solid ${phase.accent}60`, borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
                <div style={sectionHeading(phase.accent)}>🗡️ The Trial · when you're ready</div>
                <div style={{ fontSize: 13, color: "#d8d0c0", fontWeight: 600 }}>{TRIAL.detail}</div>
                <div style={{ fontSize: 11, color: "#5a7a9a", marginTop: 4, lineHeight: 1.5 }}>{TRIAL.note}</div>
                {latestTrial && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                    <label style={labelStyle}>Time · {latestTrial.date}</label>
                    <input type="text" placeholder="e.g. 58:30" value={latestTrial.time || ""}
                      onChange={ev => updateEntry(latestTrial.id, "time", ev.target.value)}
                      style={{ ...inputStyle(phase.accent), maxWidth: 140 }} />
                  </div>
                )}
                <button onClick={() => addEntry(TRIAL.id)} style={{ ...smallButton(phase.accent), marginTop: 12 }}>
                  {latestTrial ? "+ Log another attempt" : "+ Log the Trial"}
                </button>
              </div>
            )}

            {/* Milestones */}
            <div style={{ background: "#0f1923", border: `1px solid ${phase.accent}30`, borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
              <div style={sectionHeading(phase.accent)}>
                Trials Cleared — check off when achieved
              </div>
              {phase.milestones.map((m, mi) => {
                const done = !!data.milestones[m.id];
                return (
                  <div key={mi} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 0", borderBottom: mi < phase.milestones.length - 1 ? "1px solid #1a2530" : "none" }}>
                    <div style={{ marginTop: 1 }}>
                      <Checkbox checked={done} accent={phase.accent} onClick={() => toggleMilestone(m.id)} />
                    </div>
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
                All gates cleared — ascend to {phases[activePhase + 1].name.split(" — ")[0]} →
              </button>
            )}

            {/* Trial cleared — final rank achieved */}
            {phaseComplete(phase) && activePhase === phases.length - 1 && (
              <div style={{
                width: "100%", background: phase.accent + "15", border: `1px solid ${phase.accent}`, borderRadius: 8,
                padding: "16px", fontSize: 14, color: phase.accent, fontWeight: 700,
                letterSpacing: "0.02em", marginBottom: 20, textAlign: "center",
              }}>
                🗡️ The Trial is cleared. You are Umbral Assassin.
              </div>
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
              logEntries.map(e => {
                const isEditing = editingEntryId === e.uid;
                const exercises = e.type === "workout" ? e.info.def.exercises : [];
                const checkable = e.type === "workout" && !e.info.legacy;

                return (
                  <div key={e.uid} style={{
                    background: "#0f1923",
                    border: `1px solid ${isEditing ? e.accent + "80" : e.accent + "25"}`,
                    borderRadius: 7, padding: "11px 14px", marginBottom: 7,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "#d8d0c0", fontWeight: 600, marginBottom: 2 }}>
                          {e.label}
                        </div>
                        <div style={{ fontSize: 11, color: "#5a7a9a" }}>
                          {e.group}
                          {e.type === "workout" && e.entry.weekLabel && (
                            <span style={{ marginLeft: 6, color: "#3a5a7a" }}>· week of {e.entry.weekLabel}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {!isEditing && (
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 12, color: e.accent }}>{e.date}</div>
                            {e.type === "workout" && e.entry.time && (
                              <div style={{ fontSize: 12, color: "#8899aa", marginTop: 1 }}>{e.entry.time}</div>
                            )}
                            {e.type === "milestone" && (
                              <div style={{ fontSize: 10, color: e.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 1 }}>Milestone</div>
                            )}
                          </div>
                        )}
                        <button onClick={() => setEditingEntryId(isEditing ? null : e.uid)} style={{
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

                    {!isEditing && e.type === "workout" && (e.exNotes.length > 0 || (checkable && exercises.length > 0)) && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #1a2530" }}>
                        {checkable && exercises.length > 0 && (
                          <div style={{ fontSize: 12, color: "#8899aa", marginBottom: 2 }}>{e.doneCount}/{exercises.length} exercises done</div>
                        )}
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
                            value={e.date}
                            onChange={ev => {
                              if (e.type === "workout") updateEntry(e.entry.id, "date", ev.target.value);
                              else updateMilestoneDate(e.milestoneId, ev.target.value);
                            }}
                            placeholder="e.g. Jun 7, 2026"
                            style={{ ...inputStyle(e.accent), maxWidth: 200 }} />
                        </div>

                        {e.type === "workout" && e.info.def.hasTime && (
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <label style={labelStyle}>Time</label>
                            <input type="text"
                              value={e.entry.time || ""}
                              onChange={ev => updateEntry(e.entry.id, "time", ev.target.value)}
                              placeholder="e.g. 11:42"
                              style={{ ...inputStyle(e.accent), maxWidth: 200 }} />
                          </div>
                        )}

                        {exercises.map((ex, ei) => {
                          if (!checkable && !ex.trackReps && !ex.trackHangTime) return null;
                          return (
                            <div key={ei} style={{ paddingTop: 8, borderTop: "1px solid #1a2530" }}>
                              <ExerciseTracker ex={{ ...ex, note: "" }} stat={e.entry.exStats?.[ei] || {}} accent={e.accent} checkable={checkable}
                                onChange={(field, value) => updateEntryExStat(e.entry.id, ei, field, value)} />
                            </div>
                          );
                        })}

                        {e.type === "workout" && (
                          <button onClick={() => { removeEntry(e.entry.id); setEditingEntryId(null); }}
                            style={{ ...smallButton("#cc6666"), alignSelf: "flex-start" }}>
                            Delete entry
                          </button>
                        )}
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
