"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";

type Vibe = "productive" | "doomscroll" | null;

const PRODUCTIVE_LINKS = [
  {
    label: "GitHub",
    url: "https://github.com/kajalsanwalll",
    emoji: "🐙",
    sub: "push something today",
    nameColor: "#7ee787",
    borderColor: "#1a2e1a",
    bg: "#080f08",
    accentColor: "#22c55e",
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/kajalsanwall/",
    emoji: "💼",
    sub: "network era",
    nameColor: "#58a6d4",
    borderColor: "#0d1e30",
    bg: "#060d16",
    accentColor: "#0077b5",
  },
  {
    label: "LeetCode",
    url: "https://leetcode.com/u/kajalsanwall/",
    emoji: "🧩",
    sub: "grind szn",
    nameColor: "#FFA116",
    borderColor: "#2a1e00",
    bg: "#0e0900",
    accentColor: "#FFA116",
  },
  {
    label: "Udemy",
    url: "https://www.udemy.com/home/my-courses/learning/",
    emoji: "🎓",
    sub: "keep learning bestie",
    nameColor: "#c084fc",
    borderColor: "#221533",
    bg: "#0c0818",
    accentColor: "#9333ea",
  },
  {
    label: "IITM Dashboard",
    url: "https://es.study.iitm.ac.in/student_dashboard/",
    emoji: "🏛️",
    sub: "u got this kajal",
    nameColor: "#f87171",
    borderColor: "#2e0e0e",
    bg: "#100606",
    accentColor: "#ef4444",
  },
];

const DOOM_LINKS = [
  {
    label: "YouTube",
    url: "https://www.youtube.com",
    emoji: "▶️",
    sub: "watch one video (lies)",
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/kajalsanwall/",
    emoji: "📸",
    sub: "reels arc incoming",
  },
  {
    label: "Net Mirror",
    url: "https://netmirror.gg/2/en",
    emoji: "🪞",
    sub: "ur fave mirror app",
  },
  {
    label: "hd today TV",
    url: "https://hdtodayz.to",
    emoji: "📺",
    sub: "lets gooo!",
  },
];

const PRODUCTIVE_MSGS = [
  "let's get this bread bestie 💼",
  "main character energy only 🌟",
  "she's built different today 💪",
  "that girl era starts NOW ✨",
  "ur future self is watching 👀",
];

const DOOM_MSGS = [
  "we don't judge here 🫶",
  "recharge arc, very valid 🌙",
  "rest is productive too babe 💅",
  "serotonin check incoming 📱",
  "living ur best unproductive life 🛋️",
];

export default function Page() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [vibe, setVibe] = useState<Vibe>(null);
  const [msg, setMsg] = useState("");
  const [hour, setHour] = useState(0);
  const [visible, setVisible] = useState(false);
  const [linksVisible, setLinksVisible] = useState(false);

  useEffect(() => {
    setHour(new Date().getHours());
    setTimeout(() => setVisible(true), 50);
  }, []);

  if (showDashboard) return <Dashboard />;

  const greeting =
    hour < 5  ? "still up, kajal?" :
    hour < 12 ? "good morning, kajal ☀️" :
    hour < 17 ? "hey kajal 👋" :
    hour < 21 ? "evening, kajal 🌆" :
                "night owl mode, kajal 🌙";

  const pickVibe = (v: Vibe) => {
    const msgs = v === "productive" ? PRODUCTIVE_MSGS : DOOM_MSGS;
    setMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    setVibe(v);
    setLinksVisible(false);
    setTimeout(() => setLinksVisible(true), 320);
  };

  const reset = () => { setVibe(null); setMsg(""); setLinksVisible(false); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .dash-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #0a0a0a;
          color: #f5f0eb;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .bg-grain {
          position: fixed; inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0;
        }

        .bg-glow {
          position: fixed;
          width: 600px; height: 600px;
          border-radius: 50%;
          filter: blur(130px);
          pointer-events: none; z-index: 0;
          transition: opacity 0.9s ease;
        }
        .glow-pink   { background: #ec4899; top: -120px; right: -120px; opacity: 0.10; }
        .glow-purple { background: #8b5cf6; bottom: -160px; left: -160px; opacity: 0.08; }
        .glow-green  { background: #16a34a; top: -100px; left: -100px; opacity: 0; }
        .glow-doom   { background: #6d28d9; bottom: -100px; right: -100px; opacity: 0; }

        .prod-active .glow-green  { opacity: 0.12; }
        .prod-active .glow-pink   { opacity: 0.03; }
        .prod-active .glow-purple { opacity: 0.03; }
        .doom-active .glow-doom   { opacity: 0.16; }
        .doom-active .glow-pink   { opacity: 0.03; }

        .content {
          position: relative; z-index: 1;
          width: 100%; max-width: 700px;
          display: flex; flex-direction: column; align-items: center;
        }

        .fade-up { opacity: 0; transform: translateY(22px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .delay-1 { transition-delay: 0.1s; }
        .delay-2 { transition-delay: 0.2s; }
        .delay-3 { transition-delay: 0.3s; }
        .delay-4 { transition-delay: 0.4s; }
        .delay-5 { transition-delay: 0.5s; }
        .delay-6 { transition-delay: 0.6s; }

        .greeting {
          font-size: 0.75rem; font-weight: 400;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #555; margin-bottom: 1rem;
        }

        .headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 8vw, 5.5rem);
          font-weight: 900; line-height: 1.0;
          text-align: center; margin-bottom: 0.75rem;
          background: linear-gradient(135deg, #f5f0eb 0%, #c8b99a 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .subhead {
          font-size: 0.9rem; color: #4a4a4a; font-weight: 300;
          text-align: center; margin-bottom: 2.5rem;
        }

        .divider { width: 36px; height: 1px; background: #222; margin: 0 auto 2.5rem; }

        .vibe-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1rem; width: 100%; margin-bottom: 2rem;
        }

        .vibe-card {
          border: 1px solid #1a1a1a; border-radius: 16px;
          padding: 1.75rem 1.5rem; cursor: pointer;
          transition: all 0.25s ease; text-align: center;
          background: #0d0d0d; position: relative; overflow: hidden;
        }
        .vibe-card::before {
          content: ''; position: absolute; inset: 0; opacity: 0;
          transition: opacity 0.3s ease; border-radius: 16px;
        }
        .vibe-card.productive::before  { background: radial-gradient(circle at 50% 0%, rgba(34,197,94,0.13), transparent 70%); }
        .vibe-card.doomscroll::before  { background: radial-gradient(circle at 50% 0%, rgba(139,92,246,0.15), transparent 70%); }
        .vibe-card:hover               { border-color: #2e2e2e; transform: translateY(-3px); }
        .vibe-card:hover::before       { opacity: 1; }
        .vibe-card.selected.productive { border-color: #22c55e; background: #060e06; }
        .vibe-card.selected.doomscroll { border-color: #8b5cf6; background: #09061a; }

        .vibe-emoji { font-size: 2.25rem; margin-bottom: 0.6rem; display: block; }
        .vibe-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem; font-weight: 700;
          margin-bottom: 0.35rem; color: #ede8e0;
        }
        .vibe-sub { font-size: 0.74rem; color: #424242; font-weight: 300; line-height: 1.5; }

        .vibe-result {
          width: 100%; text-align: center;
          margin-bottom: 1.5rem; padding: 1rem 2rem;
          border-radius: 12px; border: 1px solid #1e1e1e;
          background: #0d0d0d;
        }
        .vibe-result-emoji { font-size: 1.3rem; }
        .vibe-result-msg {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: 1rem; color: #b8a88a;
          margin: 0.2rem 0 0.45rem;
        }
        .reset-btn {
          font-size: 0.65rem; color: #333; background: none; border: none;
          cursor: pointer; letter-spacing: 0.12em; text-transform: uppercase;
          transition: color 0.2s;
        }
        .reset-btn:hover { color: #666; }

        .ctx-links-section {
          width: 100%; margin-bottom: 2.5rem;
          opacity: 0; transform: translateY(14px);
          transition: opacity 0.45s ease, transform 0.45s ease;
          pointer-events: none;
        }
        .ctx-links-section.visible { opacity: 1; transform: translateY(0); pointer-events: auto; }

        .prod-label {
          font-size: 0.66rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: #22c55e; text-align: center; margin-bottom: 1rem; opacity: 0.75;
        }

        .prod-links-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0.7rem; width: 100%;
        }
        .prod-links-grid > a:nth-child(4) { grid-column: 1; }
        .prod-links-grid > a:nth-child(5) { grid-column: 2; }

        .prod-link-card {
          display: flex; flex-direction: column; align-items: center;
          gap: 0.4rem; padding: 1.1rem 0.6rem;
          border-radius: 12px; border: 1px solid;
          text-decoration: none; transition: all 0.22s ease;
          color: #f5f0eb; text-align: center; position: relative; overflow: hidden;
        }
        .prod-link-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 2px; opacity: 0; transition: opacity 0.2s;
        }
        .prod-link-card:hover { transform: translateY(-3px); }
        .prod-link-card:hover::after { opacity: 1; }
        .prod-link-emoji { font-size: 1.55rem; transition: transform 0.2s; }
        .prod-link-card:hover .prod-link-emoji { transform: scale(1.12); }
        .prod-link-name { font-size: 0.76rem; font-weight: 600; }
        .prod-link-sub  { font-size: 0.63rem; color: #3a3a3a; font-weight: 300; }

        .doom-label {
          font-size: 0.66rem; letter-spacing: 0.22em; text-transform: uppercase;
          color: #8b5cf6; text-align: center; margin-bottom: 1rem; opacity: 0.8;
        }
        .doom-links-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 0.7rem; width: 100%;
        }
        .doom-link-card {
          display: flex; flex-direction: column; align-items: center;
          gap: 0.45rem; padding: 1.1rem 0.6rem;
          border-radius: 12px; border: 1px solid #1e1030;
          background: #0a0614; text-decoration: none;
          transition: all 0.22s ease; color: #f5f0eb; text-align: center;
        }
        .doom-link-card:hover { border-color: #7c3aed; transform: translateY(-3px); background: #100820; }
        .doom-link-emoji { font-size: 1.55rem; transition: transform 0.2s; }
        .doom-link-card:hover .doom-link-emoji { transform: scale(1.12); }
        .doom-link-name { font-size: 0.76rem; font-weight: 600; color: #c4b5fd; }
        .doom-link-sub  { font-size: 0.63rem; color: #3a2e55; font-weight: 300; }

        .tracker-btn {
          margin-top: 0.25rem;
          padding: 0.6rem 2rem;
          border-radius: 999px;
          border: 1px solid #2a2a2a;
          background: transparent;
          color: #444;
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s, border-color 0.2s;
        }
        .tracker-btn:hover { color: #aaa; border-color: #555; }

        .footer {
          margin-top: 2.5rem; font-size: 0.65rem;
          color: #222; letter-spacing: 0.12em;
          text-transform: uppercase; text-align: center;
        }
      `}</style>

      <div className={`dash-root ${vibe === "productive" ? "prod-active" : ""} ${vibe === "doomscroll" ? "doom-active" : ""}`}>
        <div className="bg-grain" />
        <div className="bg-glow glow-pink" />
        <div className="bg-glow glow-purple" />
        <div className="bg-glow glow-green" />
        <div className="bg-glow glow-doom" />

        <div className="content">

          <p className={`greeting fade-up delay-1 ${visible ? "visible" : ""}`}>{greeting}</p>

          <h1 className={`headline fade-up delay-2 ${visible ? "visible" : ""}`}>
            what's the<br />vibe today babe?
          </h1>
          <p className={`subhead fade-up delay-3 ${visible ? "visible" : ""}`}>
            no judgement either way!
          </p>

          <div className={`divider fade-up delay-3 ${visible ? "visible" : ""}`} />

          {vibe && (
            <div className="vibe-result fade-up visible">
              <div className="vibe-result-emoji">{vibe === "productive" ? "💼" : "📱"}</div>
              <p className="vibe-result-msg">"{msg}"</p>
              <button className="reset-btn" onClick={reset}>change vibe</button>
            </div>
          )}

          <div className={`ctx-links-section ${linksVisible ? "visible" : ""}`}>
            {vibe === "productive" && (
              <>
                <p className="prod-label">✦ your productive destinations ✦</p>
                <div className="prod-links-grid">
                  {PRODUCTIVE_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="prod-link-card"
                      style={{ borderColor: link.borderColor, backgroundColor: link.bg }}
                    >
                      <style>{`.prod-link-card[href="${link.url}"]::after { background: ${link.accentColor}; }`}</style>
                      <span className="prod-link-emoji">{link.emoji}</span>
                      <span className="prod-link-name" style={{ color: link.nameColor }}>{link.label}</span>
                      <span className="prod-link-sub">{link.sub}</span>
                    </a>
                  ))}
                </div>
              </>
            )}

            {vibe === "doomscroll" && (
              <>
                <p className="doom-label">✦ your doom scroll destinations ✦</p>
                <div className="doom-links-grid">
                  {DOOM_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="doom-link-card"
                    >
                      <span className="doom-link-emoji">{link.emoji}</span>
                      <span className="doom-link-name">{link.label}</span>
                      <span className="doom-link-sub">{link.sub}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={`vibe-row fade-up delay-4 ${visible ? "visible" : ""}`}>
            <div
              className={`vibe-card productive ${vibe === "productive" ? "selected" : ""}`}
              onClick={() => pickVibe("productive")}
            >
              <span className="vibe-emoji">💼</span>
              <div className="vibe-title">Productive</div>
              <p className="vibe-sub">that girl era, hustle mode, main character doing the work</p>
            </div>
            <div
              className={`vibe-card doomscroll ${vibe === "doomscroll" ? "selected" : ""}`}
              onClick={() => pickVibe("doomscroll")}
            >
              <span className="vibe-emoji">📱</span>
              <div className="vibe-title">Doom scroll</div>
              <p className="vibe-sub">recharge arc, instagram reels, absolutely zero guilt</p>
            </div>
          </div>

          {/* Habit tracker button */}
          <button
            className={`tracker-btn fade-up delay-5 ${visible ? "visible" : ""}`}
            onClick={() => setShowDashboard(true)}
          >
            open habit tracker →
          </button>

          <p className="footer">kajal · est. 2025</p>
        </div>
      </div>
    </>
  );
}