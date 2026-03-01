"use client";

import { useMemo, useState } from "react";

type StreakData = {
  dates: string[];
};

export default function Dashboard() {
  const [dates, setDates] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];

    const stored = window.localStorage.getItem("streakData");
    const parsed: StreakData = stored
      ? JSON.parse(stored)
      : { dates: [] };

    return parsed.dates;
  });

  const today = useMemo(() => new Date(), []);

  function toggleToday() {
    const iso = today.toISOString().split("T")[0];

    let updated: string[];

    if (dates.includes(iso)) {
      updated = dates.filter((d) => d !== iso);
    } else {
      updated = [...dates, iso];
    }

    setDates(updated);
    window.localStorage.setItem(
      "streakData",
      JSON.stringify({ dates: updated })
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 space-y-8 p-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">
          Whats up babe? 🎀
        </h1>
        <p className="text-gray-500">
          what do u feel like doing today?
        </p>
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

function CalendarGrid({
  dates,
  today,
}: {
  dates: string[];
  today: Date;
}) {
  // Show last 12 weeks
  const weeksToShow = 12;

  // Clone today so we don't mutate it
  const endDate = new Date(today);

  // Go back X weeks
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - weeksToShow * 7);

  // Align to previous Sunday (GitHub style)
  const dayOfWeek = startDate.getDay(); // 0 = Sunday
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const allDates: Date[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    allDates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Group into proper weeks (Sun → Sat columns)
  const weeks: Date[][] = [];
  for (let i = 0; i < allDates.length; i += 7) {
    weeks.push(allDates.slice(i, i + 7));
  }

  return (
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
                title={date.toDateString()} // real readable date on hover
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}