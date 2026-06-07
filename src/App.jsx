import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "murph-tracker-v1";

const TARGET_WORKOUT = {
  title: "3-Month Target Workout",
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
    phase: "01",
    name: "Build the Base",
    weeks: "Weeks 1–4",
    color: "#0f1923",
    accent: "#4a9eff",
    tagline: "Establish movement quality and cardio foundation",
    schedule: [
      {
        day: "Monday — Push + Pull",
        exercises: [
          { name: "Australian pull-ups", sets: "4 sets to near failure", note: "Track max reps — this number should climb weekly" },
          { name: "Negative pull-ups", sets: "3 × 3 reps", note: "Jump to bar, take 5 full seconds to lower" },
          { name: "Knee push-ups", sets: "4 × 15", note: "Full range — chest touches floor every rep" },
          { name: "Dead hang", sets: "3 × max hold", note: "Build toward 20 sec" },
        ],
      },
      {
        day: "Tuesday — Run",
        exercises: [
          { name: "1 mile run", sets: "Conversational pace", note: "You should be able to speak in sentences. Don't race it." },
          { name: "5 min walk cooldown", sets: "", note: "" },
        ],
      },
      {
        day: "Wednesday — Rest or Walk", exercises: [],
      },
      {
        day: "Thursday — Squat + Core",
        exercises: [
          { name: "Air squats", sets: "4 × 40", note: "Controlled tempo: 2 sec down, pause at bottom, drive up" },
          { name: "Goblet squat (if available)", sets: "3 × 12", note: "Even a light KB adds load quality" },
          { name: "Plank", sets: "3 × 30–45 sec", note: "" },
          { name: "Hollow body hold", sets: "3 × 20 sec", note: "Core work directly transfers to pull-up stability" },
        ],
      },
      {
        day: "Friday — Combo Circuit",
        exercises: [
          { name: "0.5 mile run", sets: "Target sub-6:30", note: "" },
          { name: "8 rounds: 5 Aust. pull-ups / 8 knee push-ups / 20 squats", sets: "No time cap", note: "Rest as needed — focus on completing all 8 rounds" },
          { name: "0.5 mile run", sets: "", note: "Note your time. This is your weekly benchmark." },
        ],
      },
      {
        day: "Weekend — Rest", exercises: [],
      },
    ],
    milestones: [
      "Australian pull-up max reps increases week over week",
      "Complete all 8 rounds of Friday circuit without stopping",
      "Run 1 mile without stopping (any pace)",
      "20 consecutive knee push-ups",
    ],
    pullupFocus: "Log your Australian pull-up max every Monday. This is your leading indicator.",
  },
  {
    phase: "02",
    name: "Unlock Full Push-up",
    weeks: "Weeks 5–8",
    color: "#0f1923",
    accent: "#ff7c4a",
    tagline: "Transition to full push-ups. Increase pull-up load.",
    schedule: [
      {
        day: "Monday — Pull Focus",
        exercises: [
          { name: "Australian pull-ups (feet elevated)", sets: "5 sets to near failure", note: "Elevating feet increases difficulty — use a chair or bench" },
          { name: "Negative pull-ups", sets: "4 × 3–5 reps", note: "Prioritize slowness: 5–7 sec descent" },
          { name: "Banded pull-up attempts", sets: "3 × 3", note: "Use lightest band that lets you complete the rep" },
          { name: "Dead hang", sets: "3 × max", note: "Target 30 sec by end of phase" },
        ],
      },
      {
        day: "Tuesday — Run Intervals",
        exercises: [
          { name: "0.25 mile easy warmup", sets: "", note: "" },
          { name: "4 × 400m", sets: "90 sec rest between", note: "Target each 400m under 3:15. This builds your mile pace." },
          { name: "0.25 mile easy cooldown", sets: "", note: "" },
        ],
      },
      {
        day: "Wednesday — Rest", exercises: [],
      },
      {
        day: "Thursday — Push-up Transition",
        exercises: [
          { name: "Full push-up attempts", sets: "5 sets — go to failure then finish on knees", note: "Even 1–2 full reps per set counts. Log your full rep count." },
          { name: "Incline push-ups", sets: "3 × 15", note: "Use a bench or countertop — easier than floor, harder than knees" },
          { name: "Air squats", sets: "3 × 60", note: "Building toward 300 comfort" },
          { name: "Pike push-ups", sets: "3 × 8", note: "Shoulder strength for eventual pull-up" },
        ],
      },
      {
        day: "Friday — Run-First Circuit",
        exercises: [
          { name: "1 mile run", sets: "Target sub-12:30", note: "Full mile now, not 0.5" },
          { name: "5 rounds: 5 banded pull-ups / 10 push-ups (full or mixed) / 30 squats", sets: "", note: "Rest 60 sec between rounds" },
          { name: "Note total time", sets: "", note: "You are training the combo, not just the parts" },
        ],
      },
      {
        day: "Weekend — Rest", exercises: [],
      },
    ],
    milestones: [
      "1 unassisted pull-up OR 5 clean banded pull-ups",
      "10 consecutive full push-ups",
      "1 mile run under 12:30",
      "Friday circuit completed in under 35 min",
    ],
    pullupFocus: "If you haven't gotten a pull-up yet, that's okay — banded reps are the path. Don't skip negatives.",
  },
  {
    phase: "03",
    name: "Build the Volume",
    weeks: "Weeks 9–10",
    color: "#0f1923",
    accent: "#4aff9e",
    tagline: "Scale push-ups toward 75. Lock in the combo.",
    schedule: [
      {
        day: "Monday — Pull Strength",
        exercises: [
          { name: "Unassisted pull-ups", sets: "Work up to 3 × max", note: "Even if max is 1–2. Every rep counts." },
          { name: "Banded pull-ups", sets: "3 × 5 after unassisted sets", note: "" },
          { name: "Full push-ups", sets: "5 × 15", note: "Rest 90 sec between sets. Quality over speed." },
        ],
      },
      {
        day: "Tuesday — Run",
        exercises: [
          { name: "1 mile easy", sets: "", note: "" },
          { name: "1 mile at goal pace", sets: "Target sub-11:30", note: "Two miles total. Second mile is goal simulation." },
        ],
      },
      {
        day: "Wednesday — Rest", exercises: [],
      },
      {
        day: "Thursday — Push Volume",
        exercises: [
          { name: "Push-up density sets", sets: "10 push-ups every 60 sec for 10 min", note: "That's 100 push-ups. Rest the remaining seconds each minute. This builds the pace you need." },
          { name: "Air squats", sets: "2 × 100", note: "Consecutive. Time it." },
        ],
      },
      {
        day: "Friday — Full Dress Rehearsal",
        exercises: [
          { name: "1 mile run", sets: "Target 11:00", note: "" },
          { name: "5 banded pull-ups", sets: "", note: "" },
          { name: "75 push-ups", sets: "Break however needed", note: "Track time for this block" },
          { name: "300 squats", sets: "Break however needed", note: "Track time for this block" },
          { name: "1 mile run", sets: "Go", note: "Note how dead your legs feel. This is the data." },
          { name: "LOG TOTAL TIME", sets: "", note: "This is your pre-race benchmark" },
        ],
      },
      {
        day: "Weekend — Rest", exercises: [],
      },
    ],
    milestones: [
      "Complete dress rehearsal (any time)",
      "75 push-ups total in under 18 min",
      "300 squats total in under 12 min",
      "Both miles run without stopping",
    ],
    pullupFocus: "If you have 3+ unassisted pull-ups, attempt them before the band. Log both numbers.",
  },
  {
    phase: "04",
    name: "Race Week",
    weeks: "Week 11–12",
    color: "#0f1923",
    accent: "#ffd84a",
    tagline: "Taper, sharpen, execute.",
    schedule: [
      {
        day: "Monday — Short Sharpener",
        exercises: [
          { name: "2 × 3 pull-ups (banded or unassisted)", sets: "", note: "Stay fresh. No grinding." },
          { name: "3 × 10 full push-ups", sets: "", note: "" },
          { name: "2 × 20 squats", sets: "", note: "" },
        ],
      },
      {
        day: "Tuesday — Easy Mile", exercises: [
          { name: "1 easy mile", sets: "Conversational pace", note: "Shake out the legs, nothing more" },
        ],
      },
      {
        day: "Wednesday — Rest", exercises: [],
      },
      {
        day: "Thursday — Rest", exercises: [],
      },
      {
        day: "Friday or Saturday — RACE DAY", exercises: [
          { name: "🏁 1 mile run → 5 pull-ups → 75 push-ups → 300 squats → 1 mile run", sets: "Goal: Sub 60 min", note: "Warm up 10 min beforehand. Start mile 1 conservatively — you know the cost of blowing up early." },
        ],
      },
    ],
    milestones: [
      "COMPLETE THE WORKOUT",
      "Sub 60 minutes",
    ],
    pullupFocus: "Whatever pull-ups you have on race day — use them. This is not the day to ego-lift off the band.",
  },
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { exercises: {}, milestones: {} };
    const parsed = JSON.parse(raw);
    return { exercises: parsed.exercises || {}, milestones: parsed.milestones || {} };
  } catch {
    return { exercises: {}, milestones: {} };
  }
}

const backupBtnStyle = {
  background: "#0f1923",
  color: "#8899aa",
  border: "1px solid #1e2d3d",
  borderRadius: 6,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.05em",
  fontFamily: "inherit",
};

export default function MurphPlan() {
  const [activePhase, setActivePhase] = useState(0);
  const [openDay, setOpenDay] = useState(null);
  const [progress, setProgress] = useState(loadState);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const phase = phases[activePhase];

  const toggleExercise = (key) =>
    setProgress((p) => ({ ...p, exercises: { ...p.exercises, [key]: !p.exercises[key] } }));
  const toggleMilestone = (key) =>
    setProgress((p) => ({ ...p, milestones: { ...p.milestones, [key]: !p.milestones[key] } }));

  const handleExport = () => {
    const payload = {
      app: "murph-tracker",
      version: 1,
      exportedAt: new Date().toISOString(),
      data: progress,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `murph-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const data = parsed.data || parsed;
      if (!data || typeof data !== "object") throw new Error("Invalid file");
      const next = {
        exercises: data.exercises && typeof data.exercises === "object" ? data.exercises : {},
        milestones: data.milestones && typeof data.milestones === "object" ? data.milestones : {},
      };
      if (!confirm("Replace current progress with imported data?")) return;
      setProgress(next);
    } catch (err) {
      alert("Could not import file: " + err.message);
    }
  };

  const handleReset = () => {
    if (confirm("Clear all tracked progress? Export first if you want a backup.")) {
      setProgress({ exercises: {}, milestones: {} });
    }
  };

  return (
    <div style={{
      background: "#0a0f14",
      minHeight: "100vh",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8e0d0",
      padding: "0 0 60px 0",
    }}>
      <div style={{
        background: "linear-gradient(180deg, #0f1923 0%, #0a0f14 100%)",
        borderBottom: "1px solid #1e2d3d",
        padding: "36px 24px 28px",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#4a9eff",
            marginBottom: 10,
          }}>12-Week Program</div>
          <h1 style={{
            fontSize: 30,
            fontWeight: 700,
            margin: "0 0 4px 0",
            letterSpacing: "-0.02em",
            color: "#fff",
          }}>Murph Variation</h1>
          <p style={{ margin: "0 0 24px 0", color: "#8899aa", fontSize: 14 }}>
            Build toward your 3-month goal. Final form follows.
          </p>

          <div style={{
            background: "#0f1923",
            border: "1px solid #1e2d3d",
            borderRadius: 10,
            padding: "16px 20px",
          }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#4a9eff", marginBottom: 14 }}>
              {TARGET_WORKOUT.subtitle}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {TARGET_WORKOUT.sections.map((s, i) => (
                <div key={i} style={{
                  background: "#162030",
                  border: "1px solid #1e3048",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 13,
                  flex: "1 1 auto",
                  minWidth: 100,
                }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>{s.label}</div>
                  <div style={{ color: "#6a8aaa", fontSize: 11, marginTop: 2 }}>{s.detail}</div>
                </div>
              ))}
            </div>
            <div style={{
              fontSize: 11,
              color: "#4a9eff",
              borderTop: "1px solid #1e2d3d",
              paddingTop: 12,
              letterSpacing: "0.02em",
            }}>
              → {TARGET_WORKOUT.finalForm}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>

        <div style={{ display: "flex", gap: 8, margin: "20px 0 4px", flexWrap: "wrap" }}>
          <button onClick={handleExport} style={backupBtnStyle}>↓ Export JSON</button>
          <button onClick={handleImportClick} style={backupBtnStyle}>↑ Import JSON</button>
          <button onClick={handleReset} style={{ ...backupBtnStyle, color: "#cc6666", borderColor: "#3a1e1e" }}>Reset</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            style={{ display: "none" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, margin: "16px 0 20px", flexWrap: "wrap" }}>
          {phases.map((p, i) => (
            <button
              key={i}
              onClick={() => { setActivePhase(i); setOpenDay(null); }}
              style={{
                background: activePhase === i ? p.accent : "#0f1923",
                color: activePhase === i ? "#0a0f14" : "#8899aa",
                border: `1px solid ${activePhase === i ? p.accent : "#1e2d3d"}`,
                borderRadius: 6,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.05em",
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            >
              {p.phase} · {p.weeks}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: phase.accent, letterSpacing: "-0.03em" }}>
              {phase.phase}
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{phase.name}</span>
          </div>
          <p style={{ margin: 0, color: "#8899aa", fontSize: 14 }}>{phase.tagline}</p>
        </div>

        <div style={{
          background: "#0f1923",
          borderLeft: `3px solid ${phase.accent}`,
          borderRadius: "0 6px 6px 0",
          padding: "10px 14px",
          marginBottom: 20,
          fontSize: 13,
          color: "#b8c8d8",
        }}>
          <span style={{ color: phase.accent, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>Pull-up Watch · </span>
          {phase.pullupFocus}
        </div>

        <div style={{ marginBottom: 24 }}>
          {phase.schedule.map((day, di) => {
            const key = `${activePhase}-${di}`;
            const isOpen = openDay === key;
            const hasContent = day.exercises.length > 0;
            return (
              <div key={di} style={{ marginBottom: 8 }}>
                <button
                  onClick={() => hasContent && setOpenDay(isOpen ? null : key)}
                  style={{
                    width: "100%",
                    background: isOpen ? "#162030" : "#0f1923",
                    border: `1px solid ${isOpen ? phase.accent + "50" : "#1e2d3d"}`,
                    borderRadius: isOpen ? "8px 8px 0 0" : 8,
                    padding: "12px 16px",
                    textAlign: "left",
                    cursor: hasContent ? "pointer" : "default",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "all 0.1s",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: hasContent ? "#e8e0d0" : "#4a5a6a" }}>
                    {day.day}
                  </span>
                  {hasContent && (
                    <span style={{ color: phase.accent, fontSize: 16 }}>{isOpen ? "−" : "+"}</span>
                  )}
                </button>
                {isOpen && (
                  <div style={{
                    background: "#0d1820",
                    border: `1px solid ${phase.accent}30`,
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    padding: "4px 0 8px",
                  }}>
                    {day.exercises.map((ex, ei) => {
                      const exKey = `${activePhase}-${di}-${ei}`;
                      const done = !!progress.exercises[exKey];
                      return (
                        <div
                          key={ei}
                          onClick={() => toggleExercise(exKey)}
                          style={{
                            padding: "10px 16px",
                            borderBottom: ei < day.exercises.length - 1 ? "1px solid #1a2530" : "none",
                            cursor: "pointer",
                            opacity: done ? 0.55 : 1,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                            <span style={{
                              fontSize: 14,
                              color: "#d8d0c0",
                              fontWeight: 600,
                              flex: 1,
                              textDecoration: done ? "line-through" : "none",
                            }}>
                              <span style={{
                                display: "inline-block",
                                width: 14,
                                height: 14,
                                marginRight: 8,
                                border: `1px solid ${phase.accent}`,
                                borderRadius: 3,
                                background: done ? phase.accent : "transparent",
                                verticalAlign: "middle",
                                color: "#0a0f14",
                                textAlign: "center",
                                lineHeight: "12px",
                                fontSize: 11,
                              }}>{done ? "✓" : ""}</span>
                              {ex.name}
                            </span>
                            {ex.sets && (
                              <span style={{
                                fontSize: 12,
                                color: phase.accent,
                                background: phase.accent + "15",
                                padding: "2px 8px",
                                borderRadius: 4,
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}>{ex.sets}</span>
                            )}
                          </div>
                          {ex.note && (
                            <div style={{ fontSize: 12, color: "#5a7a9a", marginTop: 4, lineHeight: 1.5 }}>
                              {ex.note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          background: "#0f1923",
          border: `1px solid ${phase.accent}30`,
          borderRadius: 8,
          padding: "16px 20px",
        }}>
          <div style={{
            fontSize: 10,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: phase.accent,
            fontWeight: 700,
            marginBottom: 12,
          }}>Phase Gates — hit these before advancing</div>
          {phase.milestones.map((m, mi) => {
            const mKey = `${activePhase}-${mi}`;
            const done = !!progress.milestones[mKey];
            return (
              <div
                key={mi}
                onClick={() => toggleMilestone(mKey)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "7px 0",
                  borderBottom: mi < phase.milestones.length - 1 ? "1px solid #1a2530" : "none",
                  fontSize: 14,
                  color: "#c8c0b0",
                  cursor: "pointer",
                  opacity: done ? 0.55 : 1,
                }}
              >
                <span style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  border: `1px solid ${phase.accent}`,
                  borderRadius: 3,
                  background: done ? phase.accent : "transparent",
                  flexShrink: 0,
                  marginTop: 2,
                  color: "#0a0f14",
                  textAlign: "center",
                  lineHeight: "12px",
                  fontSize: 11,
                }}>{done ? "✓" : ""}</span>
                <span style={{ textDecoration: done ? "line-through" : "none" }}>{m}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
