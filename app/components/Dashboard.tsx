"use client";

import { useState, useEffect, useRef } from "react";

type StreakData = { dates: string[] };
type Theme = { name: string; bg: string; text: string; accent: string; accentRaw: string; mutedText: string };
type Birthday = { name: string; date: string };
type ReflectionEntry = { text: string; photo?: string };
type Habit = { id: string; name: string; emoji: string };

const defaultThemes: Theme[] = [
  { name: "Diva behaviour",   bg: "bg-white",      text: "text-gray-900",   accent: "bg-pink-500",   accentRaw: "#ec4899", mutedText: "text-gray-400" },
  { name: "Dark Feminine",    bg: "bg-gray-950",   text: "text-white",      accent: "bg-purple-500", accentRaw: "#a855f7", mutedText: "text-gray-500" },
  { name: "Spiritual baddie", bg: "bg-orange-50",  text: "text-orange-900", accent: "bg-orange-400", accentRaw: "#fb923c", mutedText: "text-orange-400" },
  { name: "Queen of Cups",    bg: "bg-blue-50",    text: "text-blue-900",   accent: "bg-blue-400",   accentRaw: "#60a5fa", mutedText: "text-blue-400" },
  { name: "Touch grass",      bg: "bg-green-50",   text: "text-green-900",  accent: "bg-green-500",  accentRaw: "#22c55e", mutedText: "text-green-500" },
  { name: "Red Velvet",       bg: "bg-red-950",    text: "text-white",      accent: "bg-rose-400",   accentRaw: "#fb7185", mutedText: "text-red-400" },
];

const defaultHabits: Habit[] = [{ id: "default", name: "My Habit", emoji: "🎀" }];

function computeStreaks(dates: string[], today: Date): { current: number; longest: number; total: number } {
  if (dates.length === 0) return { current: 0, longest: 0, total: 0 };
  const sorted = [...dates].sort();
  const todayIso = today.toISOString().split("T")[0];
  const yesterdayIso = new Date(today.getTime() - 86400000).toISOString().split("T")[0];

  let current = 0;
  const startIso = dates.includes(todayIso) ? todayIso : dates.includes(yesterdayIso) ? yesterdayIso : null;
  if (startIso) {
    const checkDate = new Date(startIso);
    while (dates.includes(checkDate.toISOString().split("T")[0])) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  let longest = 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
    if (diff === 1) { streak++; longest = Math.max(longest, streak); }
    else streak = 1;
  }
  longest = Math.max(longest, streak, current);

  return { current, longest, total: dates.length };
}

export default function Dashboard() {
  const [allDates, setAllDates] = useState<{ [id: string]: string[] }>({});
  const [theme, setTheme] = useState<Theme>(defaultThemes[0]);
  const [today] = useState(new Date());
  const [hydrated, setHydrated] = useState(false);

  const [reflections, setReflections] = useState<{ [key: string]: ReflectionEntry }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [newBirthdayName, setNewBirthdayName] = useState("");
  const [newBirthdayDate, setNewBirthdayDate] = useState("");
  const [birthdayToday, setBirthdayToday] = useState<Birthday[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [activeHabitId, setActiveHabitId] = useState("default");
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitEmoji, setNewHabitEmoji] = useState("✨");
  const [exportLoading, setExportLoading] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const activeDates = allDates[activeHabitId] || [];
  const activeHabit = habits.find((h) => h.id === activeHabitId) || habits[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedAllDates = window.localStorage.getItem("allDates");
    if (storedAllDates) {
      try { setAllDates(JSON.parse(storedAllDates)); } catch {}
    } else {
      const old = window.localStorage.getItem("streakData");
      if (old) { try { const p: StreakData = JSON.parse(old); setAllDates({ default: p.dates || [] }); } catch {} }
    }
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme) { const t = defaultThemes.find((th) => th.name === storedTheme); if (t) setTheme(t); }
    const storedRef = window.localStorage.getItem("reflections");
    if (storedRef) { try { setReflections(JSON.parse(storedRef)); } catch {} }
    const storedBd = window.localStorage.getItem("birthdays");
    if (storedBd) { try { setBirthdays(JSON.parse(storedBd)); } catch {} }
    const storedHabits = window.localStorage.getItem("habits");
    if (storedHabits) { try { setHabits(JSON.parse(storedHabits)); } catch {} }
    setHydrated(true);
  }, []);

  useEffect(() => {
    const iso = today.toISOString().split("T")[0];
    setBirthdayToday(birthdays.filter((b) => b.date === iso));
  }, [birthdays, today]);

  if (!hydrated) return null;

  const saveDates = (id: string, dates: string[]) => {
    const updated = { ...allDates, [id]: dates };
    setAllDates(updated);
    window.localStorage.setItem("allDates", JSON.stringify(updated));
  };

  const toggleToday = () => {
    const iso = today.toISOString().split("T")[0];
    saveDates(activeHabitId, activeDates.includes(iso) ? activeDates.filter((d) => d !== iso) : [...activeDates, iso]);
  };

  const saveReflection = (text: string, photo?: string) => {
    if (!selectedDate) return;
    const updated = { ...reflections, [selectedDate]: { text, photo } };
    setReflections(updated);
    window.localStorage.setItem("reflections", JSON.stringify(updated));
    setSelectedDate(null);
  };

  const addBirthday = () => {
    if (!newBirthdayName || !newBirthdayDate) return;
    const updated = [...birthdays, { name: newBirthdayName, date: newBirthdayDate }];
    setBirthdays(updated);
    window.localStorage.setItem("birthdays", JSON.stringify(updated));
    setNewBirthdayName(""); setNewBirthdayDate(""); setShowBirthdayModal(false);
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const id = `habit_${Date.now()}`;
    const updated = [...habits, { id, name: newHabitName.trim(), emoji: newHabitEmoji }];
    setHabits(updated);
    window.localStorage.setItem("habits", JSON.stringify(updated));
    setActiveHabitId(id);
    setNewHabitName(""); setNewHabitEmoji("✨"); setShowAddHabit(false);
  };

  const deleteHabit = (id: string) => {
    if (habits.length === 1) return;
    const updated = habits.filter((h) => h.id !== id);
    setHabits(updated);
    window.localStorage.setItem("habits", JSON.stringify(updated));
    if (activeHabitId === id) setActiveHabitId(updated[0].id);
    const updatedDates = { ...allDates };
    delete updatedDates[id];
    setAllDates(updatedDates);
    window.localStorage.setItem("allDates", JSON.stringify(updatedDates));
  };

  const exportAsImage = async () => {
    if (!calendarRef.current) return;
    setExportLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = calendarRef.current;
      const canvas = await html2canvas(el, {
        background: "#ffffff",
        pixelRatio: 2,
        useCORS: true,
        onclone: (_doc: Document, clonedEl: Document) => {
          (clonedEl.documentElement as HTMLElement).style.backgroundColor = "#ffffff";
          (clonedEl.documentElement as HTMLElement).style.color = "#111111";
          clonedEl.querySelectorAll<HTMLElement>("*").forEach((node: HTMLElement) => {
            const cs = window.getComputedStyle(node);
            if (cs.backgroundColor.includes("lab") || cs.backgroundColor.includes("oklch")) {
              node.style.backgroundColor = "transparent";
            }
            if (cs.color.includes("lab") || cs.color.includes("oklch")) {
              node.style.color = "#111111";
            }
          });
        },
      });
      const link = document.createElement("a");
      link.download = `${activeHabit.name.replace(/\s+/g, "_")}_tracker.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExportLoading(false);
    }
  };

  const { current: currentStreak, longest: longestStreak, total: totalDays } = computeStreaks(activeDates, today);
  const isoToday = today.toISOString().split("T")[0];
  const doneToday = activeDates.includes(isoToday);

  return (
    <div className={`flex min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300`}>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-10 py-16 gap-8">

        {/* Birthday banner */}
        {birthdayToday.length > 0 && (
          <div className="px-5 py-3 bg-yellow-100 text-yellow-900 rounded-xl shadow text-center text-sm font-medium">
            🎉 {birthdayToday.map((b) => b.name).join(", ")}'s birthday today! 💖
          </div>
        )}

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-2">Whats up babe? 🎀</h1>
          <p className={`text-base ${theme.mutedText}`}>what do u feel like doing today?</p>
        </div>

        {/* Habit tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {habits.map((h) => (
            <div key={h.id} className="flex items-center gap-1">
              <button
                onClick={() => setActiveHabitId(h.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition border-2 ${
                  activeHabitId === h.id
                    ? `${theme.accent} text-white border-transparent shadow-md`
                    : `bg-transparent border-current opacity-40 hover:opacity-70`
                }`}
              >
                {h.emoji} {h.name}
              </button>
              {habits.length > 1 && (
                <button onClick={() => deleteHabit(h.id)} className={`text-sm ${theme.mutedText} hover:text-red-400 transition`} title="Remove">×</button>
              )}
            </div>
          ))}
          <button
            onClick={() => setShowAddHabit(true)}
            className={`px-4 py-1.5 rounded-full text-sm border-2 border-dashed opacity-40 hover:opacity-70 transition`}
          >
            + new habit
          </button>
        </div>

        {/* Streak stats */}
        <div className={`flex items-center gap-0 rounded-2xl overflow-hidden border ${theme.text} border-current border-opacity-10 divide-x divide-current divide-opacity-10`}>
          {[
            { label: "Current streak", value: currentStreak, icon: "🔥" },
            { label: "Longest streak", value: longestStreak, icon: "🏆" },
            { label: "Total days", value: totalDays, icon: "📅" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center px-8 py-4 gap-0.5">
              <span className="text-3xl font-bold leading-none">{stat.value}</span>
              <span className={`text-xs ${theme.mutedText} mt-1`}>{stat.icon} {stat.label}</span>
            </div>
          ))}
        </div>

        {/* Mark today button */}
        <button
          onClick={toggleToday}
          className={`px-8 py-3 rounded-xl text-white font-semibold text-base shadow-md hover:brightness-90 active:scale-95 transition-all ${theme.accent} ${doneToday ? "opacity-70" : ""}`}
        >
          {doneToday ? "✓ Done today!" : `Mark today as done`}
        </button>

        {/* Calendar card */}
        <div ref={calendarRef} className={`${theme.bg} p-6 rounded-2xl shadow-sm border border-current border-opacity-5`}>
          <p className={`text-center text-sm font-semibold mb-4 ${theme.mutedText}`}>
            {activeHabit.emoji} {activeHabit.name}
          </p>
          <CalendarGrid
            dates={activeDates}
            today={today}
            accent={theme.accent}
            accentRaw={theme.accentRaw}
            reflections={reflections}
            onDayClick={(date) => setSelectedDate(date)}
          />
        </div>

        {/* Export */}
        <button
          onClick={exportAsImage}
          disabled={exportLoading}
          className={`text-sm px-5 py-2 rounded-xl border border-current border-opacity-20 ${theme.mutedText} hover:opacity-100 opacity-50 transition disabled:opacity-20`}
        >
          {exportLoading ? "Exporting..." : "📸 Export as image"}
        </button>

      </main>

      {/* Sidebar */}
      <aside className="flex-shrink-0 flex flex-row items-start gap-2 p-6">
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className={`mt-1 px-2 py-1 rounded-lg border border-current border-opacity-20 text-sm opacity-50 hover:opacity-100 transition`}
        >
          {sidebarOpen ? "›" : "‹"}
        </button>
        {sidebarOpen && (
          <div className={`border-l border-current border-opacity-10 pl-4 flex flex-col gap-3 pt-1`}>
            <button
              onClick={() => setShowBirthdayModal(true)}
              className={`px-3 py-1.5 ${theme.accent} text-white text-sm rounded-lg hover:brightness-90 transition`}
            >
              🎂 Birthday
            </button>
            <select
              value={theme.name}
              onChange={(e) => {
                const t = defaultThemes.find((th) => th.name === e.target.value);
                if (t) { setTheme(t); window.localStorage.setItem("theme", t.name); }
              }}
              className="px-2 py-1.5 rounded-lg border border-gray-300 text-gray-900 text-sm"
            >
              {defaultThemes.map((th) => <option key={th.name} value={th.name}>{th.name}</option>)}
            </select>
          </div>
        )}
      </aside>

      {/* Add Habit Modal */}
      {showAddHabit && (
        <Modal onClose={() => setShowAddHabit(false)} title="New Habit">
          <div className="flex gap-2 mb-1">
            <input type="text" placeholder="🙂" value={newHabitEmoji} onChange={(e) => setNewHabitEmoji(e.target.value)}
              className="w-14 px-2 py-2 border border-gray-200 rounded-lg text-center text-xl" maxLength={2} />
            <input type="text" placeholder="Habit name" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <ModalBtn onClick={() => setShowAddHabit(false)} variant="ghost">Cancel</ModalBtn>
            <ModalBtn onClick={addHabit} variant="primary">Add</ModalBtn>
          </div>
        </Modal>
      )}

      {/* Birthday Modal */}
      {showBirthdayModal && (
        <Modal onClose={() => setShowBirthdayModal(false)} title="Add Birthday">
          <input type="text" placeholder="Name" value={newBirthdayName} onChange={(e) => setNewBirthdayName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-2" />
          <input type="date" value={newBirthdayDate} onChange={(e) => setNewBirthdayDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-1" />
          <div className="flex justify-end gap-2 mt-5">
            <ModalBtn onClick={() => setShowBirthdayModal(false)} variant="ghost">Cancel</ModalBtn>
            <ModalBtn onClick={addBirthday} variant="primary">Save</ModalBtn>
          </div>
        </Modal>
      )}

      {/* Reflection Modal */}
      {selectedDate && (
        <ReflectionModal
          date={selectedDate}
          initialText={reflections[selectedDate]?.text || ""}
          initialPhoto={reflections[selectedDate]?.photo}
          onSave={saveReflection}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

// ── Shared modal shell ──────────────────────────────────────────────────────
function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-[360px] shadow-xl text-gray-900" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ModalBtn({ onClick, variant, children }: { onClick: () => void; variant: "primary" | "ghost"; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
        variant === "primary" ? "bg-pink-500 text-white hover:bg-pink-600" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

// ── Calendar grid ──────────────────────────────────────────────────────────
function CalendarGrid({ dates, today, accent, accentRaw, reflections, onDayClick }: {
  dates: string[]; today: Date; accent: string; accentRaw: string;
  reflections: { [key: string]: ReflectionEntry }; onDayClick: (date: string) => void;
}) {
  const weeksToShow = 12;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - weeksToShow * 7);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const allDates: Date[] = [];
  const cur = new Date(startDate);
  while (cur <= today) { allDates.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }

  const weeks: Date[][] = [];
  for (let i = 0; i < allDates.length; i += 7) weeks.push(allDates.slice(i, i + 7));

  // Month labels aligned to correct columns
  const monthLabels: { weekIndex: number; label: string }[] = [];
  weeks.forEach((week, i) => {
    week.forEach((date) => {
      if (date.getDate() === 1) {
        const label = date.toLocaleString("default", { month: "short" });
        if (!monthLabels.length || monthLabels[monthLabels.length - 1].label !== label) {
          monthLabels.push({ weekIndex: i, label });
        }
      }
    });
  });
  if (!monthLabels.length || monthLabels[0].weekIndex > 0) {
    const firstLabel = weeks[0]?.[0]?.toLocaleString("default", { month: "short" });
    if (firstLabel && (!monthLabels.length || monthLabels[0].label !== firstLabel)) {
      monthLabels.unshift({ weekIndex: 0, label: firstLabel });
    }
  }

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const cellSize = 14;
  const gap = 4;
  const colWidth = cellSize + gap;

  return (
    <div className="flex flex-col gap-1 select-none">
      {/* Month labels */}
      <div className="relative h-4 ml-9" style={{ width: weeks.length * colWidth }}>
        {monthLabels.map((m, i) => (
          <span key={i} className="absolute text-[10px] text-gray-400 font-medium" style={{ left: m.weekIndex * colWidth }}>
            {m.label}
          </span>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Weekday labels */}
        <div className="flex flex-col gap-1 text-[10px] text-gray-400 w-8 shrink-0">
          {weekdays.map((d) => (
            <div key={d} style={{ height: cellSize }} className="flex items-center">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((date) => {
                const iso = date.toISOString().split("T")[0];
                const done = dates.includes(iso);
                const future = date > today;
                const hasRef = !!reflections[iso];
                return (
                  <div
                    key={iso}
                    onClick={() => !future && onDayClick(iso)}
                    title={`${date.toDateString()}${hasRef ? " · has reflection" : ""}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: future ? "transparent" : done ? accentRaw : "#e5e7eb",
                      outline: hasRef ? "2px solid #facc15" : "none",
                      outlineOffset: "1px",
                    }}
                    className={`rounded-[3px] transition-opacity ${future ? "" : "cursor-pointer hover:opacity-80"}`}
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

// ── Reflection modal ───────────────────────────────────────────────────────
function ReflectionModal({ date, initialText, initialPhoto, onSave, onClose }: {
  date: string; initialText: string; initialPhoto?: string;
  onSave: (text: string, photo?: string) => void; onClose: () => void;
}) {
  const [text, setText] = useState(initialText);
  const [photo, setPhoto] = useState<string | undefined>(initialPhoto);

  return (
    <Modal onClose={onClose} title={`${date} — Reflection`}>
      <textarea
        className="w-full h-28 px-3 py-2 border border-gray-200 rounded-xl mb-3 resize-none text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write something about your day..."
      />
      <input type="file" accept="image/*" className="text-sm mb-2"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = () => setPhoto(r.result as string);
          r.readAsDataURL(f);
        }}
      />
      {photo && <img src={photo} className="w-20 h-20 object-cover rounded-xl mb-3" alt="reflection" />}
      <div className="flex justify-end gap-2 mt-2">
        <ModalBtn onClick={onClose} variant="ghost">Close</ModalBtn>
        <ModalBtn onClick={() => onSave(text, photo)} variant="primary">Save</ModalBtn>
      </div>
    </Modal>
  );
}