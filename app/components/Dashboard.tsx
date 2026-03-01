"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────
type StreakData = { dates: string[] };

type Theme = {
  name: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  glow: string;
};

type Birthday         = { name: string; date: string };
type ReflectionEntry  = { text: string; photo?: string };
type Habit            = { id: string; name: string; emoji: string };

// ── Themes ────────────────────────────────────────────────────────────────
const THEMES: Theme[] = [
  {
    name: "Diva behaviour",
    bg: "#0d0d0d", surface: "#131313", border: "#242424",
    text: "#f5f0eb", muted: "#555555",
    accent: "#ec4899", accentText: "#ffffff", glow: "#ec4899",
  },
  {
    name: "Dark Feminine",
    bg: "#0a0a0f", surface: "#13121a", border: "#2a2535",
    text: "#f0eaf8", muted: "#6b5f7a",
    accent: "#a855f7", accentText: "#ffffff", glow: "#a855f7",
  },
  {
    name: "Spiritual baddie",
    bg: "#0e0804", surface: "#160f06", border: "#2e1e0a",
    text: "#fdf0e0", muted: "#7a5535",
    accent: "#fb923c", accentText: "#0e0804", glow: "#fb923c",
  },
  {
    name: "Queen of Cups",
    bg: "#04080e", surface: "#060d18", border: "#0d1e30",
    text: "#e0eeff", muted: "#3a5a80",
    accent: "#60a5fa", accentText: "#04080e", glow: "#60a5fa",
  },
  {
    name: "Touch grass",
    bg: "#04080a", surface: "#060f08", border: "#0d1e10",
    text: "#e0f5e4", muted: "#2d6035",
    accent: "#4ade80", accentText: "#04080a", glow: "#4ade80",
  },
  {
    name: "Red Velvet",
    bg: "#0f0608", surface: "#1a0a0d", border: "#3a1520",
    text: "#fce8ec", muted: "#a05060",
    accent: "#fb7185", accentText: "#0f0608", glow: "#fb7185",
  },
];

// ── Streak computation ────────────────────────────────────────────────────
function computeStreaks(dates: string[], today: Date) {
  if (!dates.length) return { current: 0, longest: 0, total: 0 };
  const sorted = [...dates].sort();
  const todayIso     = today.toISOString().split("T")[0];
  const yesterdayIso = new Date(today.getTime() - 86400000).toISOString().split("T")[0];

  let current = 0;
  const startIso = dates.includes(todayIso) ? todayIso : dates.includes(yesterdayIso) ? yesterdayIso : null;
  if (startIso) {
    const d = new Date(startIso);
    while (dates.includes(d.toISOString().split("T")[0])) { current++; d.setDate(d.getDate() - 1); }
  }

  let longest = 0, streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
    longest = Math.max(longest, streak);
  }
  longest = Math.max(longest, streak, current);
  return { current, longest, total: dates.length };
}

// ── Main component ────────────────────────────────────────────────────────
export default function Dashboard({ onBack }: { onBack?: () => void }) {
  const [allDates,   setAllDates]   = useState<Record<string, string[]>>({});
  const [theme,      setTheme]      = useState<Theme>(THEMES[0]);
  const [today]                     = useState(new Date());
  const [hydrated,   setHydrated]   = useState(false);

  const [reflections,      setReflections]      = useState<Record<string, ReflectionEntry>>({});
  const [selectedDate,     setSelectedDate]      = useState<string | null>(null);
  const [birthdays,        setBirthdays]         = useState<Birthday[]>([]);
  const [birthdayToday,    setBirthdayToday]     = useState<Birthday[]>([]);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [newBirthdayName,  setNewBirthdayName]   = useState("");
  const [newBirthdayDate,  setNewBirthdayDate]   = useState("");

  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [habits,        setHabits]        = useState<Habit[]>([{ id: "default", name: "My Habit", emoji: "🎀" }]);
  const [activeHabitId, setActiveHabitId] = useState("default");
  const [showAddHabit,  setShowAddHabit]  = useState(false);
  const [newHabitName,  setNewHabitName]  = useState("");
  const [newHabitEmoji, setNewHabitEmoji] = useState("✨");
  const [exportLoading, setExportLoading] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);

  const activeDates = allDates[activeHabitId] || [];
  const activeHabit = habits.find(h => h.id === activeHabitId) ?? habits[0];
  const isoToday    = today.toISOString().split("T")[0];
  const doneToday   = activeDates.includes(isoToday);
  const { current: currentStreak, longest: longestStreak, total: totalDays } = computeStreaks(activeDates, today);

  useEffect(() => {
    const get = (k: string) => { try { return JSON.parse(localStorage.getItem(k) ?? "null"); } catch { return null; } };
    const ad = get("allDates");
    if (ad) setAllDates(ad);
    else { const old = get("streakData"); if (old) setAllDates({ default: old.dates ?? [] }); }
    const t = THEMES.find(th => th.name === localStorage.getItem("theme"));
    if (t) setTheme(t);
    const ref = get("reflections"); if (ref) setReflections(ref);
    const bd  = get("birthdays");   if (bd)  setBirthdays(bd);
    const hb  = get("habits");      if (hb)  setHabits(hb);
    setHydrated(true);
  }, []);

  useEffect(() => {
    setBirthdayToday(birthdays.filter(b => b.date === isoToday));
  }, [birthdays, isoToday]);

  const saveDates = useCallback((id: string, dates: string[]) => {
    setAllDates(prev => {
      const next = { ...prev, [id]: dates };
      localStorage.setItem("allDates", JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleToday = () =>
    saveDates(activeHabitId, doneToday ? activeDates.filter(d => d !== isoToday) : [...activeDates, isoToday]);

  const saveReflection = (text: string, photo?: string) => {
    if (!selectedDate) return;
    setReflections(prev => {
      const next = { ...prev, [selectedDate]: { text, photo } };
      localStorage.setItem("reflections", JSON.stringify(next));
      return next;
    });
    setSelectedDate(null);
  };

  const addBirthday = () => {
    if (!newBirthdayName || !newBirthdayDate) return;
    const next = [...birthdays, { name: newBirthdayName, date: newBirthdayDate }];
    setBirthdays(next);
    localStorage.setItem("birthdays", JSON.stringify(next));
    setNewBirthdayName(""); setNewBirthdayDate(""); setShowBirthdayModal(false);
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const id = `habit_${Date.now()}`;
    const next = [...habits, { id, name: newHabitName.trim(), emoji: newHabitEmoji }];
    setHabits(next); localStorage.setItem("habits", JSON.stringify(next));
    setActiveHabitId(id); setNewHabitName(""); setNewHabitEmoji("✨"); setShowAddHabit(false);
  };

  const deleteHabit = (id: string) => {
    if (habits.length === 1) return;
    const next = habits.filter(h => h.id !== id);
    setHabits(next); localStorage.setItem("habits", JSON.stringify(next));
    if (activeHabitId === id) setActiveHabitId(next[0].id);
    setAllDates(prev => { const n = { ...prev }; delete n[id]; localStorage.setItem("allDates", JSON.stringify(n)); return n; });
  };

  const exportAsImage = async () => {
    if (!calendarRef.current) return;
    setExportLoading(true);
    try {
      const h2c = (await import("html2canvas")).default as unknown as (el: HTMLElement, opts?: object) => Promise<HTMLCanvasElement>;
      const canvas = await h2c(calendarRef.current, {
        backgroundColor: theme.bg,
        scale: 2,
        useCORS: true,
        onclone: (clonedDoc: Document) => {
          (clonedDoc.querySelectorAll("*") as NodeListOf<HTMLElement>).forEach(node => {
            const cs = window.getComputedStyle(node);
            if (cs.backgroundColor.includes("lab") || cs.backgroundColor.includes("oklch")) node.style.backgroundColor = "transparent";
            if (cs.color.includes("lab") || cs.color.includes("oklch")) node.style.color = theme.text;
          });
        },
      });
      const a = document.createElement("a");
      a.download = `${activeHabit.name.replace(/\s+/g, "_")}_tracker.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    } catch (e) { console.error("Export failed", e); }
    finally { setExportLoading(false); }
  };

  const changeTheme = (name: string) => {
    const t = THEMES.find(th => th.name === name);
    if (t) { setTheme(t); localStorage.setItem("theme", t.name); }
  };

  if (!hydrated) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .db-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          position: relative;
          overflow: hidden;
          transition: background 0.4s, color 0.4s;
        }

        .db-grain {
          position: fixed; inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0;
        }

        .db-glow-1 {
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          filter: blur(120px); opacity: 0.08; pointer-events: none; z-index: 0;
          top: -150px; right: -150px;
          transition: background 0.4s, opacity 0.4s;
        }
        .db-glow-2 {
          position: fixed; width: 400px; height: 400px; border-radius: 50%;
          filter: blur(100px); opacity: 0.06; pointer-events: none; z-index: 0;
          bottom: -100px; left: -100px;
          transition: background 0.4s, opacity 0.4s;
        }

        .db-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2.5rem;
          gap: 2rem;
          position: relative;
          z-index: 1;
        }

        .db-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 900;
          line-height: 1.1;
          text-align: center;
          margin-bottom: 0.3rem;
          letter-spacing: -0.01em;
        }

        .db-subhead {
          font-size: 0.85rem;
          font-weight: 300;
          text-align: center;
          letter-spacing: 0.05em;
        }

        /* Habit tabs */
        .db-tab-active {
          padding: 0.375rem 1rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600;
          border: 1px solid transparent; cursor: pointer; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .db-tab-inactive {
          padding: 0.375rem 1rem; border-radius: 999px; font-size: 0.85rem; font-weight: 400;
          cursor: pointer; transition: all 0.2s; background: transparent;
          font-family: 'DM Sans', sans-serif; opacity: 0.5;
        }
        .db-tab-inactive:hover { opacity: 0.8; }
        .db-tab-add {
          padding: 0.375rem 1rem; border-radius: 999px; font-size: 0.85rem;
          background: transparent; cursor: pointer; opacity: 0.4;
          transition: opacity 0.2s; font-family: 'DM Sans', sans-serif;
        }
        .db-tab-add:hover { opacity: 0.7; }

        /* Stats */
        .db-stats {
          display: flex;
          border-radius: 14px;
          overflow: hidden;
        }
        .db-stat-cell {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 1rem 2rem; gap: 0.2rem;
        }
        .db-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem; font-weight: 900; line-height: 1;
        }
        .db-stat-label {
          font-size: 0.65rem; text-transform: uppercase;
          letter-spacing: 0.12em; font-weight: 400;
        }

        /* Mark today button */
        .db-mark-btn {
          padding: 0.75rem 2.5rem; border-radius: 12px; font-weight: 700;
          font-size: 0.95rem; border: none; cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.02em;
        }
        .db-mark-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .db-mark-btn:active { transform: scale(0.97); }

        /* Calendar card */
        .db-cal-card {
          border-radius: 16px;
          padding: 1.5rem 1.75rem;
        }
        .db-cal-title {
          font-size: 0.75rem; font-weight: 500; text-align: center;
          margin-bottom: 1rem; letter-spacing: 0.1em; text-transform: uppercase;
        }

        /* Export btn */
        .db-export-btn {
          padding: 0.45rem 1.25rem; border-radius: 999px; font-size: 0.72rem;
          background: transparent; cursor: pointer; letter-spacing: 0.12em;
          text-transform: uppercase; transition: opacity 0.2s;
          font-family: 'DM Sans', sans-serif; opacity: 0.4;
        }
        .db-export-btn:hover { opacity: 0.7; }
        .db-export-btn:disabled { opacity: 0.2; cursor: default; }

        /* Back btn */
        .db-back-btn {
          padding: 0.45rem 1.25rem; border-radius: 999px; font-size: 0.72rem;
          background: transparent; cursor: pointer; letter-spacing: 0.12em;
          text-transform: uppercase; transition: opacity 0.2s;
          font-family: 'DM Sans', sans-serif; opacity: 0.35;
          border: none;
        }
        .db-back-btn:hover { opacity: 0.7; }

        /* Sidebar */
        .db-sidebar {
          flex-shrink: 0;
          display: flex; flex-direction: row; align-items: flex-start;
          gap: 0.5rem; padding: 1.5rem;
          position: relative; z-index: 1;
        }
        .db-sidebar-toggle {
          margin-top: 0.25rem; padding: 0.25rem 0.6rem;
          border-radius: 8px; cursor: pointer; font-size: 0.875rem;
          background: transparent; transition: opacity 0.2s; opacity: 0.4;
          font-family: 'DM Sans', sans-serif;
        }
        .db-sidebar-toggle:hover { opacity: 0.8; }
        .db-sidebar-inner {
          display: flex; flex-direction: column; gap: 0.75rem; padding-top: 0.25rem;
          padding-left: 1rem;
        }
        .db-sidebar-btn {
          padding: 0.375rem 0.875rem; border: none; border-radius: 8px;
          font-size: 0.8rem; cursor: pointer; font-weight: 500;
          font-family: 'DM Sans', sans-serif; transition: opacity 0.2s;
        }
        .db-sidebar-btn:hover { opacity: 0.85; }
        .db-theme-select {
          padding: 0.4rem 0.6rem; border-radius: 8px; font-size: 0.75rem;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
        }

        /* Birthday banner */
        .db-bday-banner {
          padding: 0.65rem 1.25rem;
          background: rgba(254, 249, 195, 0.12);
          border: 1px solid rgba(234, 179, 8, 0.25);
          border-radius: 10px; font-size: 0.825rem; font-weight: 500;
          text-align: center; color: #fef08a;
        }

        /* Divider */
        .db-divider { width: 36px; height: 1px; margin: 0 auto; }
      `}</style>

      <div
        className="db-root"
        style={{ background: theme.bg, color: theme.text }}
      >
        {/* Background effects */}
        <div className="db-grain" />
        <div className="db-glow-1" style={{ background: theme.glow }} />
        <div className="db-glow-2" style={{ background: theme.glow }} />

        {/* ── Main ── */}
        <main className="db-main">

          {birthdayToday.length > 0 && (
            <div className="db-bday-banner">
              🎉 {birthdayToday.map(b => b.name).join(", ")}'s birthday today! 💖
            </div>
          )}

          {/* Heading */}
          <div style={{ textAlign: "center" }}>
            <h1 className="db-headline">Whats up babe? 🎀</h1>
            <div className="db-divider" style={{ background: theme.border, marginBottom: "0.5rem", marginTop: "0.75rem" }} />
            <p className="db-subhead" style={{ color: theme.muted }}>what do u feel like doing today?</p>
          </div>

          {/* Habit tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" }}>
            {habits.map(h => (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <button
                  onClick={() => setActiveHabitId(h.id)}
                  className={activeHabitId === h.id ? "db-tab-active" : "db-tab-inactive"}
                  style={activeHabitId === h.id
                    ? { background: theme.accent, color: theme.accentText, border: `1px solid ${theme.accent}`, boxShadow: `0 2px 12px ${theme.accent}33` }
                    : { border: `1px solid ${theme.border}`, color: theme.muted }
                  }
                >
                  {h.emoji} {h.name}
                </button>
                {habits.length > 1 && (
                  <button onClick={() => deleteHabit(h.id)}
                    style={{ background: "none", border: "none", color: theme.muted, cursor: "pointer", fontSize: "1rem", opacity: 0.5 }}
                  >×</button>
                )}
              </div>
            ))}
            <button className="db-tab-add"
              onClick={() => setShowAddHabit(true)}
              style={{ border: `1px dashed ${theme.border}`, color: theme.muted }}
            >
              + new habit
            </button>
          </div>

          {/* Streak stats */}
          <div className="db-stats" style={{ border: `1px solid ${theme.border}` }}>
            {[
              { label: "Current streak", value: currentStreak, icon: "🔥" },
              { label: "Longest streak", value: longestStreak, icon: "🏆" },
              { label: "Total days",     value: totalDays,     icon: "📅" },
            ].map((s, i) => (
              <div key={s.label} className="db-stat-cell"
                style={{ borderLeft: i > 0 ? `1px solid ${theme.border}` : "none" }}
              >
                <span className="db-stat-value">{s.value}</span>
                <span className="db-stat-label" style={{ color: theme.muted }}>{s.icon} {s.label}</span>
              </div>
            ))}
          </div>

          {/* Mark today */}
          <button
            className="db-mark-btn"
            onClick={toggleToday}
            style={{
              background: doneToday ? "transparent" : theme.accent,
              color: doneToday ? theme.accent : theme.accentText,
              border: `1px solid ${theme.accent}`,
              opacity: doneToday ? 0.75 : 1,
              boxShadow: doneToday ? "none" : `0 4px 24px ${theme.accent}33`,
            }}
          >
            {doneToday ? "✓ done today!" : "mark today as done"}
          </button>

          {/* Calendar card */}
          <div
            ref={calendarRef}
            className="db-cal-card"
            style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
          >
            <p className="db-cal-title" style={{ color: theme.muted }}>
              {activeHabit.emoji} {activeHabit.name}
            </p>
            <CalendarGrid
              dates={activeDates}
              today={today}
              accentRaw={theme.accent}
              borderColor={theme.border}
              reflections={reflections}
              onDayClick={setSelectedDate}
            />
          </div>

          {/* Bottom actions */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {onBack && (
              <button
                className="db-back-btn"
                onClick={onBack}
                style={{ border: `1px solid ${theme.border}`, color: theme.muted }}
              >
                ← back to home
              </button>
            )}
            <button
              className="db-export-btn"
              onClick={exportAsImage}
              disabled={exportLoading}
              style={{ border: `1px solid ${theme.border}`, color: theme.muted }}
            >
              {exportLoading ? "exporting..." : "📸 export"}
            </button>
          </div>

        </main>

        {/* ── Sidebar ── */}
        <aside className="db-sidebar">
          <button
            className="db-sidebar-toggle"
            onClick={() => setSidebarOpen(p => !p)}
            style={{ border: `1px solid ${theme.border}`, color: theme.muted }}
          >
            {sidebarOpen ? "›" : "‹"}
          </button>
          {sidebarOpen && (
            <div className="db-sidebar-inner" style={{ borderLeft: `1px solid ${theme.border}` }}>
              <button
                className="db-sidebar-btn"
                onClick={() => setShowBirthdayModal(true)}
                style={{ background: theme.accent, color: theme.accentText }}
              >
                🎂 Birthday
              </button>
              <select
                className="db-theme-select"
                value={theme.name}
                onChange={e => changeTheme(e.target.value)}
                style={{ border: `1px solid ${theme.border}`, background: theme.surface, color: theme.text }}
              >
                {THEMES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          )}
        </aside>

        {/* ── Modals ── */}
        {showAddHabit && (
          <DarkModal onClose={() => setShowAddHabit(false)} title="New Habit" theme={theme}>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <input type="text" placeholder="🙂" value={newHabitEmoji} onChange={e => setNewHabitEmoji(e.target.value)}
                maxLength={2} style={inputStyle(theme)} />
              <input type="text" placeholder="Habit name" value={newHabitName} onChange={e => setNewHabitName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addHabit()} style={{ ...inputStyle(theme), flex: 1 }} />
            </div>
            <DarkModalFooter onCancel={() => setShowAddHabit(false)} onConfirm={addHabit} confirmLabel="Add" theme={theme} />
          </DarkModal>
        )}

        {showBirthdayModal && (
          <DarkModal onClose={() => setShowBirthdayModal(false)} title="Add Birthday" theme={theme}>
            <input type="text" placeholder="Name" value={newBirthdayName} onChange={e => setNewBirthdayName(e.target.value)}
              style={{ ...inputStyle(theme), width: "100%", marginBottom: "0.5rem" }} />
            <input type="date" value={newBirthdayDate} onChange={e => setNewBirthdayDate(e.target.value)}
              style={{ ...inputStyle(theme), width: "100%", colorScheme: "dark" }} />
            <DarkModalFooter onCancel={() => setShowBirthdayModal(false)} onConfirm={addBirthday} confirmLabel="Save" theme={theme} />
          </DarkModal>
        )}

        {selectedDate && (
          <ReflectionModal
            date={selectedDate}
            initialText={reflections[selectedDate]?.text ?? ""}
            initialPhoto={reflections[selectedDate]?.photo}
            onSave={saveReflection}
            onClose={() => setSelectedDate(null)}
            theme={theme}
          />
        )}
      </div>
    </>
  );
}

// ── Input style factory ───────────────────────────────────────────────────
function inputStyle(theme: Theme): React.CSSProperties {
  return {
    padding: "0.5rem 0.75rem", borderRadius: 8,
    border: `1px solid ${theme.border}`,
    background: theme.surface, color: theme.text,
    fontSize: "0.875rem", outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  };
}

// ── Dark modal ────────────────────────────────────────────────────────────
function DarkModal({ children, onClose, title, theme }: {
  children: React.ReactNode; onClose: () => void; title: string; theme: Theme;
}) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: theme.surface, borderRadius: 16, padding: "1.5rem", width: 360,
        border: `1px solid ${theme.border}`,
        boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${theme.border}`,
        color: theme.text, fontFamily: "'DM Sans', sans-serif",
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700, fontSize: "1.15rem", marginBottom: "1rem", color: theme.text,
        }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function DarkModalFooter({ onCancel, onConfirm, confirmLabel, theme }: {
  onCancel: () => void; onConfirm: () => void; confirmLabel: string; theme: Theme;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.25rem" }}>
      <button onClick={onCancel} style={{
        padding: "0.5rem 1.25rem", borderRadius: 8, border: `1px solid ${theme.border}`,
        background: "transparent", color: theme.muted, cursor: "pointer",
        fontSize: "0.825rem", fontFamily: "'DM Sans', sans-serif",
      }}>Cancel</button>
      <button onClick={onConfirm} style={{
        padding: "0.5rem 1.25rem", borderRadius: 8, border: "none",
        background: theme.accent, color: theme.accentText, cursor: "pointer",
        fontWeight: 600, fontSize: "0.825rem", fontFamily: "'DM Sans', sans-serif",
        boxShadow: `0 2px 12px ${theme.accent}44`,
      }}>{confirmLabel}</button>
    </div>
  );
}

// ── Reflection modal ──────────────────────────────────────────────────────
function ReflectionModal({ date, initialText, initialPhoto, onSave, onClose, theme }: {
  date: string; initialText: string; initialPhoto?: string;
  onSave: (text: string, photo?: string) => void; onClose: () => void; theme: Theme;
}) {
  const [text,  setText]  = useState(initialText);
  const [photo, setPhoto] = useState(initialPhoto);

  return (
    <DarkModal onClose={onClose} title={`${date} — Reflection`} theme={theme}>
      <textarea
        value={text} onChange={e => setText(e.target.value)}
        placeholder="Write something about your day..."
        style={{ ...inputStyle(theme), width: "100%", height: 112, resize: "none", display: "block", marginBottom: "0.75rem" }}
      />
      <input type="file" accept="image/*"
        style={{ fontSize: "0.78rem", marginBottom: "0.5rem", color: theme.muted }}
        onChange={e => {
          const f = e.target.files?.[0]; if (!f) return;
          const r = new FileReader(); r.onload = () => setPhoto(r.result as string); r.readAsDataURL(f);
        }}
      />
      {photo && <img src={photo} alt="reflection" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, marginBottom: "0.75rem", border: `1px solid ${theme.border}` }} />}
      <DarkModalFooter onCancel={onClose} onConfirm={() => onSave(text, photo)} confirmLabel="Save" theme={theme} />
    </DarkModal>
  );
}

// ── Calendar grid ─────────────────────────────────────────────────────────
function CalendarGrid({ dates, today, accentRaw, borderColor, reflections, onDayClick }: {
  dates: string[]; today: Date; accentRaw: string; borderColor: string;
  reflections: Record<string, ReflectionEntry>; onDayClick: (d: string) => void;
}) {
  const WEEKS = 12;
  const start = new Date(today);
  start.setDate(today.getDate() - WEEKS * 7 - today.getDay());

  const allDays: Date[] = [];
  const c = new Date(start);
  while (c <= today) { allDays.push(new Date(c)); c.setDate(c.getDate() + 1); }

  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) weeks.push(allDays.slice(i, i + 7));

  const monthLabels: { weekIndex: number; label: string }[] = [];
  weeks.forEach((week, i) => {
    week.forEach(d => {
      if (d.getDate() === 1) {
        const lbl = d.toLocaleString("default", { month: "short" });
        if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== lbl)
          monthLabels.push({ weekIndex: i, label: lbl });
      }
    });
  });
  if (!monthLabels.length || monthLabels[0].weekIndex > 0) {
    const lbl = weeks[0]?.[0]?.toLocaleString("default", { month: "short" });
    if (lbl && (!monthLabels.length || monthLabels[0].label !== lbl))
      monthLabels.unshift({ weekIndex: 0, label: lbl });
  }

  const CELL = 14, GAP = 4, COL = CELL + GAP;
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div style={{ userSelect: "none", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ position: "relative", height: 16, marginLeft: 36, width: weeks.length * COL }}>
        {monthLabels.map((m, i) => (
          <span key={i} style={{ position: "absolute", left: m.weekIndex * COL, fontSize: 10, color: "#6b7280", fontWeight: 500 }}>
            {m.label}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: GAP, width: 32, flexShrink: 0 }}>
          {DAYS.map(d => (
            <div key={d} style={{ height: CELL, fontSize: 10, color: "#6b7280", display: "flex", alignItems: "center" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: GAP }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
              {week.map(date => {
                const iso    = date.toISOString().split("T")[0];
                const done   = dates.includes(iso);
                const future = date > today;
                const hasRef = !!reflections[iso];
                return (
                  <div
                    key={iso}
                    title={`${date.toDateString()}${hasRef ? " · has reflection" : ""}`}
                    onClick={() => !future && onDayClick(iso)}
                    style={{
                      width: CELL, height: CELL, borderRadius: 3,
                      backgroundColor: future ? "transparent" : done ? accentRaw : "#2a2a2a",
                      outline: hasRef ? "2px solid #facc15" : "none",
                      outlineOffset: 1,
                      cursor: future ? "default" : "pointer",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => { if (!future) (e.currentTarget as HTMLDivElement).style.opacity = "0.7"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}