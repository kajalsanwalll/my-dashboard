"use client";

import { useState, useEffect } from "react";

type StreakData = { dates: string[] };
type Theme = { name: string; bg: string; text: string; accent: string };
type Birthday = { name: string; date: string };
type ReflectionEntry = { text: string; photo?: string };

const defaultThemes: Theme[] = [
  { name: "Diva behaviour", bg: "bg-white", text: "text-gray-900", accent: "bg-pink-500" },
  { name: "Dark Feminine", bg: "bg-gray-900", text: "text-white", accent: "bg-purple-500" },
  { name: "Spiritual baddie", bg: "bg-orange-50", text: "text-orange-900", accent: "bg-orange-400" },
  { name: "Queen of Cups", bg: "bg-blue-50", text: "text-blue-900", accent: "bg-blue-400" },
  { name: "Touch grass", bg: "bg-green-50", text: "text-green-900", accent: "bg-green-400" },
  { name: "Red Velvet", bg: "bg-red-900", text: "text-white", accent: "bg-black" },
];

export default function Dashboard() {
  const [dates, setDates] = useState<string[]>([]);
  const [theme, setTheme] = useState<Theme>(defaultThemes[0]);
  const [today, setToday] = useState(new Date());
  const [hydrated, setHydrated] = useState(false);

  // Reflections
  const [reflections, setReflections] = useState<{ [key: string]: ReflectionEntry }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Birthdays
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [newBirthdayName, setNewBirthdayName] = useState("");
  const [newBirthdayDate, setNewBirthdayDate] = useState("");
  const [birthdayToday, setBirthdayToday] = useState<Birthday[]>([]);

  // Sidebar collapse
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Hydrate localStorage data
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedStreaks = window.localStorage.getItem("streakData");
    if (storedStreaks) {
      try {
        const parsed: StreakData = JSON.parse(storedStreaks);
        setDates(parsed.dates || []);
      } catch {}
    }

    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme) {
      const t = defaultThemes.find((th) => th.name === storedTheme);
      if (t) setTheme(t);
    }

    const storedReflections = window.localStorage.getItem("reflections");
    if (storedReflections) {
      try { setReflections(JSON.parse(storedReflections)); } catch {}
    }

    const storedBirthdays = window.localStorage.getItem("birthdays");
    if (storedBirthdays) {
      try { setBirthdays(JSON.parse(storedBirthdays)); } catch {}
    }

    setHydrated(true);
  }, []);

  // Check today's birthdays
  useEffect(() => {
    const isoToday = today.toISOString().split("T")[0];
    const todayBirthdays = birthdays.filter((b) => b.date === isoToday);
    setBirthdayToday(todayBirthdays);

    if (todayBirthdays.length > 0 && "Notification" in window) {
      if (Notification.permission === "granted") {
        todayBirthdays.forEach((b) =>
          new Notification("Birthday Alert! 🎉", { body: `${b.name} has a birthday today!` })
        );
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            todayBirthdays.forEach((b) =>
              new Notification("Birthday Alert! 🎉", { body: `${b.name} has a birthday today!` })
            );
          }
        });
      }
    }
  }, [birthdays, today]);

  if (!hydrated) return null;

  const toggleToday = () => {
    const iso = today.toISOString().split("T")[0];
    const updated = dates.includes(iso) ? dates.filter((d) => d !== iso) : [...dates, iso];
    setDates(updated);
    window.localStorage.setItem("streakData", JSON.stringify({ dates: updated }));
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
    setNewBirthdayName("");
    setNewBirthdayDate("");
    setShowBirthdayModal(false);
  };

  return (
    <div className={`flex min-h-screen ${theme.bg} ${theme.text} p-8`}>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center space-y-8 transition-colors duration-300">
        {birthdayToday.length > 0 && (
          <div className="p-3 bg-yellow-100 text-yellow-900 rounded-md shadow-md text-center">
            🎉 {birthdayToday.map((b) => b.name).join(", ")}'s birthday today! 💖
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
          onDayClick={(date) => setSelectedDate(date)}
        />
      </main>

      {/* Sidebar */}
      <aside className="flex-shrink-0 ml-8 flex flex-row items-start gap-2">
        {/* Collapse/Expand toggle button */}
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="mt-1 px-2 py-1 rounded-md border border-gray-300 text-sm hover:bg-gray-100 transition"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? "›" : "‹"}
        </button>

        {/* Sidebar content */}
        {sidebarOpen && (
          <div className="border-l border-gray-300 pl-4 flex flex-col gap-4">
            {/* Add Birthday */}
            <button
              onClick={() => setShowBirthdayModal(true)}
              className="px-2 py-1 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
            >
              Add Birthday
            </button>

            {/* Theme Selector */}
            <select
              value={theme.name}
              onChange={(e) => {
                const t = defaultThemes.find((th) => th.name === e.target.value);
                if (t) { setTheme(t); window.localStorage.setItem("theme", t.name); }
              }}
              className="px-2 py-1 rounded-md border border-gray-300"
            >
              {defaultThemes.map((th) => (
                <option key={th.name} value={th.name}>{th.name}</option>
              ))}
            </select>
          </div>
        )}
      </aside>

      {/* Birthday Modal */}
      {showBirthdayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-96 text-gray-900 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Add Birthday</h2>
            <input
              type="text"
              placeholder="Name"
              value={newBirthdayName}
              onChange={(e) => setNewBirthdayName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2"
            />
            <input
              type="date"
              value={newBirthdayDate}
              onChange={(e) => setNewBirthdayDate(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBirthdayModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={addBirthday}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
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
// CalendarGrid Component
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
  reflections: { [key: string]: ReflectionEntry };
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
      <div className="flex gap-2 ml-8 text-xs text-gray-500">
        {monthLabels.map((m) => (
          <div key={m.index} className="w-5 text-center font-medium">{m.label}</div>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-2 text-xs text-gray-500">
          {weekdays.map((day) => (
            <div key={day} className="h-5 flex items-center">{day}</div>
          ))}
        </div>

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
                      isFuture ? "bg-transparent" : isCompleted ? accent : "bg-gray-300"
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
  initialPhoto,
  onSave,
  onClose,
}: {
  date: string;
  initialText: string;
  initialPhoto?: string;
  onSave: (text: string, photo?: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initialText);
  const [photo, setPhoto] = useState<string | undefined>(initialPhoto);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md p-6 w-96 text-gray-900 shadow-lg">
        <h2 className="text-lg font-semibold mb-2">{date} Reflection</h2>
        <textarea
          className="w-full h-24 p-2 border border-gray-300 rounded-md mb-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write something about your day..."
        />
        <div className="mb-2">
          <input type="file" accept="image/*" onChange={handlePhotoUpload} />
        </div>
        {photo && <img src={photo} className="w-24 h-24 object-cover rounded-md mb-2" alt="reflection photo" />}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition">
            Close
          </button>
          <button onClick={() => onSave(text, photo)} className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}