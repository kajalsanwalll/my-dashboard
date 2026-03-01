"use client";

import { useEffect, useState } from "react";

type StreakData = {
  dates: string[];
};

export default function Dashboard() {
  const [dates, setDates] = useState<string[]>([]);
  const [today, setToday] = useState<Date | null>(null);

  // ✅ Use a function to safely load localStorage once
  useEffect(() => {
    const init = () => {
      const stored = window.localStorage.getItem("streakData");
      const parsed: StreakData = stored
        ? JSON.parse(stored)
        : { dates: [] };

      // Only set state if changed (prevents unnecessary rerender warning)
      setDates(parsed.dates);
      setToday(new Date());
    };

    init();
  }, []);

  if (!today) return null; // wait until client renders

  const toggleToday = () => {
    const iso = today.toISOString().split("T")[0];
    const updated = dates.includes(iso)
      ? dates.filter((d) => d !== iso)
      : [...dates, iso];

    setDates(updated);
    window.localStorage.setItem("streakData", JSON.stringify({ dates: updated }));
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 space-y-8 p-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Whats up babe? 🎀</h1>
        <p className="text-gray-500">what do u feel like doing today?</p>
      </div>

      <button
        onClick={toggleToday}
        className="px-5 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
      >
        Toggle Today
      </button>

      <CalendarGrid dates={dates} today={today} />
    </main>
  );
}

function CalendarGrid({ dates, today }: { dates: string[]; today: Date }) {
  const weeksToShow = 12;

  const endDate = new Date(today);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - weeksToShow * 7);

  // Align to Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const allDates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    allDates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Group into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < allDates.length; i += 7) {
    weeks.push(allDates.slice(i, i + 7));
  }

  // Month labels
  const monthLabels: { index: number; label: string }[] = [];
  weeks.forEach((week, i) => {
    const firstDay = week[0];
    const prevWeek = weeks[i - 1];
    if (i === 0 || firstDay.getMonth() !== prevWeek?.[0].getMonth()) {
      monthLabels.push({
        index: i,
        label: firstDay.toLocaleString("default", { month: "short" }),
      });
    }
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-3">
      {/* Month Labels */}
      <div className="flex gap-2 ml-8 text-xs text-gray-500">
        {weeks.map((_, i) => {
          const month = monthLabels.find((m) => m.index === i);
          return (
            <div key={i} className="w-5 text-center">
              {month ? month.label : ""}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        {/* Weekday Labels */}
        <div className="flex flex-col gap-2 text-xs text-gray-500">
          {weekdays.map((day) => (
            <div key={day} className="h-5 flex items-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
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
                      isFuture
                        ? "bg-transparent"
                        : isCompleted
                        ? "bg-pink-500"
                        : "bg-pink-200"
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