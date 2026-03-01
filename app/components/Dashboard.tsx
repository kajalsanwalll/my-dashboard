"use client";

import { useState, useEffect } from "react";

type StreakData = { dates: string[] };
type Theme = { name: string; bg: string; text: string; accent: string };
type Birthday = { name: string; date: string };

const themes: Theme[] = [
  { name: "Diva behaviour", bg: "bg-white", text: "text-gray-900", accent: "bg-pink-500" },
  { name: "Dark Feminine", bg: "bg-gray-900", text: "text-white", accent: "bg-purple-500" },
  { name: "Spiritual baddie", bg: "bg-orange-50", text: "text-orange-900", accent: "bg-orange-400" },
  { name: "Queen of Cups", bg: "bg-blue-50", text: "text-blue-900", accent: "bg-blue-400" },
  { name: "Touch grass", bg: "bg-green-50", text: "text-green-900", accent: "bg-green-400" },
  { name: "Red Velvet", bg: "bg-red-900", text: "text-white", accent: "bg-black" },
];

// Example birthdays (add more as needed)
const birthdays: Birthday[] = [
  { name: "Alice", date: "2026-03-01" },
  { name: "Bob", date: "2026-03-05" },
];

export default function Dashboard() {
  const [dates, setDates] = useState<string[]>([]);
  const [theme, setTheme] = useState<Theme>(themes[0]);
  const [today, setToday] = useState<Date>(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [reflections, setReflections] = useState<{ [key: string]: string }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [birthdayToday, setBirthdayToday] = useState<Birthday[]>([]);

  // Hydration + load localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("streakData");
    if (stored) {
      try {
        const parsed: StreakData = JSON.parse(stored);
        setDates(parsed.dates || []);
      } catch {}
    }

    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme) {
      const t = themes.find((th) => th.name === JSON.parse(storedTheme));
      if (t) setTheme(t);
    }

    const storedReflections = window.localStorage.getItem("reflections");
    if (storedReflections) {
      try {
        setReflections(JSON.parse(storedReflections));
      } catch {}
    }

    const now = new Date();
    setToday(now);

    // Check birthdays
    const isoToday = now.toISOString().split("T")[0];
    const todayBirthdays = birthdays.filter((b) => b.date === isoToday);
    setBirthdayToday(todayBirthdays);

    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const toggleToday = () => {
    const iso = today.toISOString().split("T")[0];
    const updated = dates.includes(iso) ? dates.filter((d) => d !== iso) : [...dates, iso];
    setDates(updated);
    window.localStorage.setItem("streakData", JSON.stringify({ dates: updated }));
  };

  const handleThemeChange = (th: Theme) => {
    setTheme(th);
    window.localStorage.setItem("theme", JSON.stringify(th.name));
  };

  const openReflection = (date: string) => setSelectedDate(date);
  const saveReflection = (text: string) => {
    if (!selectedDate) return;
    const updated = { ...reflections, [selectedDate]: text };
    setReflections(updated);
    window.localStorage.setItem("reflections", JSON.stringify(updated));
    setSelectedDate(null);
  };

  return (
    <div className={`flex min-h-screen ${theme.bg} ${theme.text} p-8`}>
      <main className="flex-1 flex flex-col items-center justify-center space-y-8 transition-colors duration-300">
        {/* Birthday Notification */}
        {birthdayToday.length > 0 && (
          <div className="p-3 bg-yellow-100 text-yellow-900 rounded-md shadow-md text-center">
            🎉 {birthdayToday.map((b) => b.name).join(", ")}'s birthday today! Don't forget to wish 💖
          </div>
        )}

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">Whats up babe? 🎀</h1>
          <p className="text-gray-500">what do u feel like doing today?</p>
        </div>

        <button
          onClick={toggleToday}
          className={`px-5 py-2 rounded-md hover:brightness-90 transition ${theme.accent} text-white`}
        >
          Toggle Today
        </button>

        <CalendarGrid
          dates={dates}
          today={today}
          accent={theme.accent}
          reflections={reflections}
          onDayClick={openReflection}
        />
      </main>

      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 ml-8 border-l border-gray-300 pl-4 transition-all duration-500 ease-in-out ${
          sidebarOpen ? "w-48" : "w-12"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mb-4 px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          {sidebarOpen ? "⏴" : "⏵"}
        </button>

        {sidebarOpen ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium mb-4">Choose Your Mood Theme</h2>
            {themes.map((th) => (
              <button
                key={th.name}
                onClick={() => handleThemeChange(th)}
                className={`px-3 py-1 rounded-md text-white ${th.accent} ${
                  theme.name === th.name ? "ring-2 ring-offset-1 ring-gray-500" : ""
                }`}
              >
                {th.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 items-center mt-2">
            {themes.map((th) => (
              <div
                key={th.name}
                onClick={() => handleThemeChange(th)}
                title={th.name}
                className={`w-5 h-5 rounded-full cursor-pointer transition-transform hover:scale-125 ${th.accent}`}
              />
            ))}
          </div>
        )}
      </aside>

      {/* Reflection Modal */}
      {selectedDate && (
        <ReflectionModal
          date={selectedDate}
          initialText={reflections[selectedDate] || ""}
          onSave={saveReflection}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

// CalendarGrid with reflections
function CalendarGrid({
  dates,
  today,
  accent,
  reflections,
  onDayClick,
}: {
  dates: string[];
  today: Date;
  accent: string;
  reflections: { [key: string]: string };
  onDayClick: (date: string) => void;
}) {
  const weeksToShow = 12;

  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - weeksToShow * 7);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const allDates: Date[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    allDates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < allDates.length; i += 7) weeks.push(allDates.slice(i, i + 7));

  const monthLabels: { index: number; label: string }[] = [];
  weeks.forEach((week, i) => {
    const firstDay = week[0];
    const prevWeek = weeks[i - 1];
    if (i === 0 || firstDay.getMonth() !== prevWeek?.[0].getMonth()) {
      monthLabels.push({ index: i, label: firstDay.toLocaleString("default", { month: "short" }) });
    }
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-3">
      {/* Month labels */}
      <div className="flex gap-2 ml-8 text-xs text-gray-500">
        {monthLabels.map((m) => (
          <div key={m.index} className="w-5 text-center font-medium">
            {m.label}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {/* Weekdays */}
        <div className="flex flex-col gap-2 text-xs text-gray-500">
          {weekdays.map((day) => (
            <div key={day} className="h-5 flex items-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-2 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-2">
              {week.map((date) => {
                const iso = date.toISOString().split("T")[0];
                const isCompleted = dates.includes(iso);
                const isFuture = date > today;
                const hasReflection = reflections[iso];

                return (
                  <div
                    key={iso}
                    onClick={() => !isFuture && onDayClick(iso)}
                    className={`w-5 h-5 rounded-sm cursor-pointer transition ${
                      isFuture
                        ? "bg-transparent"
                        : isCompleted
                        ? accent
                        : "bg-gray-300"
                    } ${hasReflection ? "ring-2 ring-yellow-400" : ""}`}
                    title={`${date.toDateString()}${hasReflection ? " – Reflection exists" : ""}`}
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

// Reflection Modal Component
function ReflectionModal({
  date,
  initialText,
  onSave,
  onClose,
}: {
  date: string;
  initialText: string;
  onSave: (text: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initialText);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 w-96 text-gray-900 shadow-lg">
        <h2 className="text-lg font-semibold mb-2">{date} Reflection</h2>
        <textarea
          className="w-full h-32 p-2 border border-gray-300 rounded-md mb-4"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write something about your day..."
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Close
          </button>
          <button
            onClick={() => onSave(text)}
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}