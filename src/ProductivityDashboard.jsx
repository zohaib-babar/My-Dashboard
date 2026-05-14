import { useState, useEffect, useRef } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const initialTasks = [
  { id: 1, text: "Morning planning session", done: true, p: "high" },
  { id: 2, text: "Reply to emails", done: true, p: "med" },
  { id: 3, text: "Work on main project", done: false, p: "high" },
  { id: 4, text: "Read 30 pages", done: true, p: "low" },
  { id: 5, text: "Exercise / walk", done: false, p: "med" },
  { id: 6, text: "Review weekly goals", done: false, p: "high" },
  { id: 7, text: "Prepare tomorrow list", done: false, p: "low" },
];

const initialHabits = [
  { name: "Wake 6am",    data: [1,1,1,0,1,1,0] },
  { name: "Meditate",    data: [1,0,1,1,0,1,0] },
  { name: "Exercise",    data: [1,1,0,1,1,0,0] },
  { name: "No phone 1h", data: [0,1,1,0,1,1,0] },
  { name: "Reading",     data: [1,1,1,1,0,0,0] },
  { name: "Sleep 10pm",  data: [1,0,1,1,1,0,0] },
];

const goals = [
  { name: "Launch side project",     pct: 65, color: "#c8f135" },
  { name: "Read 12 books this year", pct: 42, color: "#4fffb0" },
  { name: "Exercise 5x/week habit",  pct: 78, color: "#ff6b35" },
  { name: "Save 30% income",         pct: 55, color: "#f0c040" },
  { name: "Learn new skill",         pct: 30, color: "#a78bfa" },
];

const weeklyVals = [82, 91, 67, 75, 60, 45, 0];

function getTodayIdx() {
  return (new Date().getDay() + 6) % 7;
}

function formatDateStr(d) {
  return d.toLocaleDateString("en-PK", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatTime12(d) {
  let h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return (
    String(h).padStart(2, "0") + ":" +
    String(m).padStart(2, "0") + ":" +
    String(s).padStart(2, "0") + " " + ampm
  );
}

function formatTimer(s) {
  return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

function getWeekRange() {
  const today = new Date();
  const d = today.getDay();
  const mon = new Date(today);
  mon.setDate(today.getDate() - ((d + 6) % 7));
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return (
    mon.toLocaleDateString("en", { month: "short", day: "numeric" }) +
    " – " +
    sun.toLocaleDateString("en", { month: "short", day: "numeric" })
  );
}

const styles = {
  root: {
    fontFamily: "'Syne', sans-serif",
    background: "#0f0f0f",
    color: "#f0ede6",
    minHeight: "100vh",
    padding: "20px",
  },
  topbar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 24, borderBottom: "1px solid #2e2e2e", paddingBottom: 16,
  },
  h1: { fontSize: 20, fontWeight: 700, letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 10 },
  clock: { fontSize: 13, fontFamily: "'DM Mono', monospace", color: "#c8f135" },
  dateStr: { fontSize: 12, color: "#888", fontFamily: "'DM Mono', monospace", marginTop: 2 },
  scoreBadge: {
    background: "#c8f135", color: "#0f0f0f",
    fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
    padding: "6px 14px", borderRadius: 2,
  },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 10, marginBottom: 16 },
  card: { background: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: 4, padding: "14px 16px" },
  cardLabel: { fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#888", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 },
  cardVal: { fontSize: 28, fontWeight: 700, lineHeight: 1 },
  cardSub: { fontSize: 11, color: "#888", marginTop: 4, fontFamily: "'DM Mono', monospace" },
  sectionLabel: { fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#888", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, display: "block" },
  addBtn: {
    background: "none", border: "1px solid #2e2e2e", color: "#888",
    fontSize: 16, width: 24, height: 24, borderRadius: 2,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  },
  taskItem: { display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #2e2e2e" },
  taskCheck: (done) => ({
    width: 16, height: 16, borderRadius: 2, border: "1px solid #2e2e2e",
    cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
    background: done ? "#c8f135" : "transparent", borderColor: done ? "#c8f135" : "#2e2e2e",
    fontSize: 10, color: "#0f0f0f", fontWeight: 700,
  }),
  taskText: (done) => ({ fontSize: 13, flex: 1, textDecoration: done ? "line-through" : "none", color: done ? "#888" : "#f0ede6" }),
  priority: (p) => {
    const map = {
      high: { background: "#3d1a10", color: "#ff6b35", border: "1px solid #ff6b35" },
      med:  { background: "#2a2a10", color: "#f0c040", border: "1px solid #f0c040" },
      low:  { background: "#102a1a", color: "#4fffb0", border: "1px solid #4fffb0" },
    };
    return { fontSize: 9, fontFamily: "'DM Mono', monospace", padding: "2px 6px", borderRadius: 2, flexShrink: 0, ...map[p] };
  },
  addTaskWrap: { display: "flex", gap: 6, marginTop: 10 },
  addTaskInput: {
    flex: 1, background: "#242424", border: "1px solid #2e2e2e", borderRadius: 2,
    color: "#f0ede6", fontFamily: "'DM Mono', monospace", fontSize: 12, padding: "6px 10px", outline: "none",
  },
  addTaskBtn: {
    background: "#c8f135", color: "#0f0f0f", border: "none",
    fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 600,
    padding: "6px 14px", borderRadius: 2, cursor: "pointer",
  },
  habitRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  habitName: { fontSize: 12, width: 90, color: "#f0ede6", flexShrink: 0 },
  habitDots: { display: "flex", gap: 4, flex: 1 },
  dot: (state) => ({
    width: 18, height: 18, borderRadius: 2, cursor: "pointer", flexShrink: 0,
    background: state === "done" ? "#c8f135" : state === "partial" ? "#4a5c10" : "#242424",
    border: state === "done" ? "1px solid #c8f135" : state === "partial" ? "1px solid #c8f135" : "1px solid #2e2e2e",
  }),
  habitPct: { fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#888", width: 32, textAlign: "right", flexShrink: 0 },
  goalItem: { marginBottom: 14 },
  goalTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  goalName: { fontSize: 12 },
  goalPct: { fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#888" },
  barBg: { height: 4, background: "#242424", borderRadius: 2, overflow: "hidden" },
  timerCard: {
    background: "#1a1a1a", border: "1px solid #2e2e2e", borderRadius: 4, padding: "14px 16px",
    display: "flex", flexDirection: "column", alignItems: "center",
  },
  timerDisplay: { fontSize: 36, fontFamily: "'DM Mono', monospace", fontWeight: 500, color: "#c8f135", letterSpacing: 2, margin: "10px 0 6px" },
  timerStatus: { fontSize: 10, color: "#888", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: 1.5 },
  timerBtns: { display: "flex", gap: 8, marginTop: 12 },
  timerBtn: (active) => ({
    background: active ? "#c8f135" : "none",
    border: "1px solid #2e2e2e",
    color: active ? "#0f0f0f" : "#f0ede6",
    fontFamily: "'DM Mono', monospace", fontSize: 11, padding: "5px 14px",
    borderRadius: 2, cursor: "pointer",
  }),
  weekBarsWrap: { display: "flex", gap: 6, alignItems: "flex-end", height: 80, marginTop: 12 },
  barCol: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  barDay: { fontSize: 9, fontFamily: "'DM Mono', monospace" },
  noteInput: {
    width: "100%", background: "#242424", border: "1px solid #2e2e2e", borderRadius: 2,
    color: "#f0ede6", fontFamily: "'DM Mono', monospace", fontSize: 12,
    padding: 10, resize: "none", outline: "none", lineHeight: 1.6, marginTop: 10,
  },
  legend: { display: "flex", gap: 16, marginTop: 10, paddingTop: 10, borderTop: "1px solid #2e2e2e" },
  legendItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#888", fontFamily: "'DM Mono', monospace" },
  legendDot: (bg, border) => ({ width: 12, height: 12, borderRadius: 2, background: bg, border }),
  habitsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  habitsHeaderSpan: { fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#888", textTransform: "uppercase", letterSpacing: 1.5 },
};

// localStorage helpers
function lsGet(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function ProductivityDashboard() {
  const [now, setNow] = useState(new Date());
  const [tasks, setTasks] = useState(() => lsGet("pdhq_tasks", initialTasks));
  const [habits, setHabits] = useState(() => lsGet("pdhq_habits", initialHabits));
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [nextId, setNextId] = useState(() => lsGet("pdhq_nextId", 8));
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [focusSessions, setFocusSessions] = useState(0);
  const [timerStatus, setTimerStatus] = useState("Pomodoro");
  const [note, setNote] = useState(() => lsGet("pdhq_note", ""));
  const timerRef = useRef(null);
  const lastDateRef = useRef(formatDateStr(new Date()));

  // Save tasks to localStorage whenever they change
  useEffect(() => { lsSet("pdhq_tasks", tasks); }, [tasks]);

  // Save habits to localStorage whenever they change
  useEffect(() => { lsSet("pdhq_habits", habits); }, [habits]);

  // Save note to localStorage whenever it changes
  useEffect(() => { lsSet("pdhq_note", note); }, [note]);

  // Save nextId
  useEffect(() => { lsSet("pdhq_nextId", nextId); }, [nextId]);

  // Live clock + midnight date change detection
  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setNow(d);
      const newDateStr = formatDateStr(d);
      if (newDateStr !== lastDateRef.current) {
        lastDateRef.current = newDateStr;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayIdx = getTodayIdx();

  // Score
  const taskScore = tasks.length ? tasks.filter(t => t.done).length / tasks.length : 0;
  const habitDone = habits.filter(h => h.data[todayIdx]).length;
  const habitScore = habitDone / habits.length;
  const score = Math.round((taskScore * 0.5 + habitScore * 0.5) * 100);

  // Timer
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setRunning(false);
            setFocusSessions(s => s + 1);
            setTimerStatus("✓ Session done!");
            setTimeout(() => setTimerStatus("Pomodoro"), 2000);
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  function toggleTask(id) {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function addTask() {
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: nextId, text: newTaskText.trim(), done: false, p: "med" }]);
    setNextId(nextId + 1);
    setNewTaskText("");
    setShowAddTask(false);
  }

  function toggleHabit(hi, di) {
    if (di > todayIdx) return;
    setHabits(habits.map((h, i) => {
      if (i !== hi) return h;
      const newData = [...h.data];
      newData[di] = newData[di] ? 0 : 1;
      return { ...h, data: newData };
    }));
  }

  function resetTimer() {
    setRunning(false);
    setTimerSeconds(25 * 60);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f0f0f; }
        input::placeholder { color: #555; }
        textarea::placeholder { color: #555; }

        .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
        @media (max-width: 1024px) { .grid4 { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .grid4 { grid-template-columns: 1fr; } }

        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        @media (max-width: 768px) { .grid2 { grid-template-columns: 1fr; } }

        .grid3 { display: grid; grid-template-columns: 1fr 1fr 1.4fr; gap: 10px; margin-bottom: 16px; }
        @media (max-width: 1024px) { .grid3 { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 768px) { .grid3 { grid-template-columns: 1fr; } }

        .root { padding: 20px; }
        @media (max-width: 768px) { .root { padding: 10px; } }

        .topbar { margin-bottom: 24px; }
        @media (max-width: 768px) { .topbar { margin-bottom: 16px; } }
      `}</style>

      <div className="root" style={styles.root}>
        {/* Topbar */}
        <div className="topbar" style={styles.topbar}>
          <div>
            <h1 style={styles.h1}>
              Productivity HQ
              <span style={styles.clock}>{formatTime12(now)}</span>
            </h1>
            <p style={styles.dateStr}>{formatDateStr(now)}</p>
          </div>
          <div style={styles.scoreBadge}>Score: {score}%</div>
        </div>

        {/* Metric Cards */}
        <div className="grid4" style={{ gap: 10, marginBottom: 16 }}>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Tasks Done</div>
            <div style={{ ...styles.cardVal, color: "#c8f135" }}>{tasks.filter(t => t.done).length}</div>
            <div style={styles.cardSub}>of {tasks.length} today</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Habits</div>
            <div style={{ ...styles.cardVal, color: "#4fffb0" }}>{habitDone}/6</div>
            <div style={styles.cardSub}>completed today</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Focus Time</div>
            <div style={{ ...styles.cardVal, color: "#ff6b35" }}>{focusSessions * 25}m</div>
            <div style={styles.cardSub}>{focusSessions} sessions today</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Streak</div>
            <div style={styles.cardVal}>🔥 12</div>
            <div style={styles.cardSub}>days in a row</div>
          </div>
        </div>

        {/* Tasks + Goals */}
        <div className="grid2" style={{ gap: 10, marginBottom: 16 }}>
          {/* Tasks */}
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ ...styles.sectionLabel, margin: 0 }}>Today's Tasks</span>
              <button style={styles.addBtn} onClick={() => setShowAddTask(s => !s)}>+</button>
            </div>
            {showAddTask && (
              <div style={styles.addTaskWrap}>
                <input
                  style={styles.addTaskInput}
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTask()}
                  placeholder="New task..."
                  autoFocus
                />
                <button style={styles.addTaskBtn} onClick={addTask}>Add</button>
              </div>
            )}
            {tasks.map((t, i) => (
              <div key={t.id} style={{ ...styles.taskItem, borderBottom: i === tasks.length - 1 ? "none" : "1px solid #2e2e2e" }}>
                <div style={styles.taskCheck(t.done)} onClick={() => toggleTask(t.id)}>
                  {t.done && "✓"}
                </div>
                <span style={styles.taskText(t.done)}>{t.text}</span>
                <span style={styles.priority(t.p)}>{t.p.toUpperCase()}</span>
              </div>
            ))}
          </div>

          {/* Goals */}
          <div style={styles.card}>
            <span style={styles.sectionLabel}>Goals Progress</span>
            {goals.map(g => (
              <div key={g.name} style={styles.goalItem}>
                <div style={styles.goalTop}>
                  <span style={styles.goalName}>{g.name}</span>
                  <span style={styles.goalPct}>{g.pct}%</span>
                </div>
                <div style={styles.barBg}>
                  <div style={{ height: "100%", width: `${g.pct}%`, background: g.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Habits + Timer + Weekly */}
        <div className="grid3" style={{ gap: 10, marginBottom: 16 }}>
//           {/* Habits */}
//           <div style={{ ...styles.card, gridColumn: "span 2" }}>
            <div style={styles.habitsHeader}>
              <span style={styles.habitsHeaderSpan}>Daily Habits — This Week</span>
              <span style={styles.habitsHeaderSpan}>{getWeekRange()}</span>
            </div>
            {habits.map((h, hi) => {
              const sliceDone = h.data.slice(0, todayIdx + 1).reduce((a, b) => a + b, 0);
              const pct = Math.round(sliceDone / (todayIdx + 1) * 100);
              return (
                <div key={h.name} style={styles.habitRow}>
                  <span style={styles.habitName}>{h.name}</span>
                  <div style={styles.habitDots}>
                    {DAYS.map((day, di) => {
                      const state = di > todayIdx ? "future" : h.data[di] ? "done" : "missed";
                      return (
                        <div
                          key={day}
                          style={styles.dot(state)}
                          title={`${day}: ${state}`}
                          onClick={() => toggleHabit(hi, di)}
                        />
                      );
                    })}
                  </div>
                  <span style={styles.habitPct}>{pct}%</span>
                </div>
              );
            })}
            <div style={styles.legend}>
              <div style={styles.legendItem}><div style={styles.legendDot("#c8f135", "none")} />Done</div>
              <div style={styles.legendItem}><div style={styles.legendDot("#4a5c10", "1px solid #c8f135")} />Partial</div>
              <div style={styles.legendItem}><div style={styles.legendDot("#242424", "1px solid #2e2e2e")} />Missed</div>
            </div>
          </div>

          {/* Timer + Weekly */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={styles.timerCard}>
              <span style={styles.timerStatus}>Focus Timer</span>
              <div style={styles.timerDisplay}>{formatTimer(timerSeconds)}</div>
              <div style={{ fontSize: 10, color: "#888", fontFamily: "'DM Mono', monospace" }}>{timerStatus}</div>
              <div style={styles.timerBtns}>
                <button style={styles.timerBtn(running)} onClick={() => setRunning(r => !r)}>
                  {running ? "Pause" : "Start"}
                </button>
                <button style={styles.timerBtn(false)} onClick={resetTimer}>Reset</button>
              </div>
            </div>

            <div style={{ ...styles.card, flex: 1 }}>
              <span style={styles.sectionLabel}>Weekly Output</span>
              <div style={styles.weekBarsWrap}>
                {DAYS.map((day, i) => {
                  const h = i > todayIdx ? 0 : Math.round((weeklyVals[i] / Math.max(...weeklyVals, 1)) * 68);
                  const color = i === todayIdx ? "#c8f135" : i < todayIdx ? "#3a5a10" : "#242424";
                  return (
                    <div key={day} style={styles.barCol}>
                      <div style={{ height: h, background: color, width: "100%", borderRadius: "2px 2px 0 0", minHeight: 4 }} />
                      <span style={{ ...styles.barDay, color: i === todayIdx ? "#c8f135" : "#888" }}>{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Notes */}
        <div style={styles.card}>
          <span style={styles.sectionLabel}>Quick Notes</span>
          <textarea
            style={styles.noteInput}
            rows={3}
            placeholder="Aaj ke notes yahan likho..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>
      </div>
    </>
  );
}
