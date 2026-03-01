"use client";

import { useState, useEffect } from "react";

type StreakData = { dates: string[] };
type Theme = { name: string; bg: string; text: string; accent: string };

const themes: Theme[] = [
  { name: "Diva behaviour", bg: "bg-white", text: "text-gray-900", accent: "bg-pink-500" },
  { name: "Dark Feminine", bg: "bg-gray-900", text: "text-white", accent: "bg-purple-500" },
  { name: "Spiritual baddie", bg: "bg-orange-50", text: "text-orange-900", accent: "bg-orange-400" },
  { name: "Queen of Cups", bg: "bg-blue-50", text: "text-blue-900", accent: "bg-blue-400" },
  { name: "Touch grass", bg: "bg-green-50", text: "text-green-900", accent: "bg-green-400" },
  { name: "Red Velvet", bg: "bg-red-900", text: "text-white", accent: "bg-black" },
];

export default function Dashboard() {
  // default stable values (no window usage here)
  const [dates, setDates] = useState<string[]>([]);
  const [theme, setTheme] = useState<Theme>(themes[0]);
  const [today, setToday] = useState<Date>(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false); // flag to render after client

  useEffect(() => {
    // defer all state updates to next tick
    setTimeout(() => {
      // load streaks
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("streakData");
        if (stored) {
          try {
            const parsed: StreakData = JSON.parse(stored);
            setDates(parsed.dates || []);
          } catch {}
        }

        // load theme
        const storedTheme = window.localStorage.getItem("theme");
        if (storedTheme) {
          const t = themes.find((th) => th.name === storedTheme);
          if (t) setTheme(t);
        }
      }

      setToday(new Date());
      setHydrated(true);
    }, 0);
  }, []);

  if (!hydrated) return null; // wait until client render

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

  return (
    <div className={`flex min-h-screen ${theme.bg} ${theme.text} p-8`}>
      <main className="flex-1 flex flex-col items-center justify-center space-y-8 transition-colors duration-300">
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

        <CalendarGrid dates={dates} today={today} accent={theme.accent} />
      </main>

      <aside
        className={`flex-shrink-0 ml-8 border-l border-gray-300 pl-4 transition-all duration-300 ${
          sidebarOpen ? "w-48" : "w-12"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mb-4 px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          {sidebarOpen ? "⏴" : "⏵"}
        </button>

        {sidebarOpen && (
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
        )}
      </aside>
    </div>
  );
}

// CalendarGrid stays same
function CalendarGrid({ dates, today, accent }: { dates: string[]; today: Date; accent: string }) {
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
      <div className="flex gap-2 ml-8 text-xs text-gray-500">
        {weeks.map((_, i) => {
          const month = monthLabels.find((m) => m.index === i);
          return (
            <div key={i} className="w-5 text-center font-medium">
              {month ? month.label : ""}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-2 text-xs text-gray-500">
          {weekdays.map((day) => (
            <div key={day} className="h-5 flex items-center">
              {day}
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-2">
              {week.map((date) => {
                const iso = date.toISOString().split("T")[0];
                const isCompleted = dates.includes(iso);
                const isFuture = date > today;

                return (
                  <div
                    key={iso}
                    className={`w-5 h-5 rounded-sm transition ${
                      isFuture ? "bg-transparent" : isCompleted ? accent : "bg-gray-300"
                    }`}
                    title={date.toDateString()}
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