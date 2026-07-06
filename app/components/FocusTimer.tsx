"use client";

import { useEffect, useState } from "react";
import { Task } from "./TaskCard";

interface Props {
  task: Task;
  onClose: () => void;
}

export default function FocusTimer({ task, onClose }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(task.duration * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          alert(`🎉 ${task.title} completed!`);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [task, onClose]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#111",
          color: "white",
          padding: "2rem",
          borderRadius: "18px",
          width: 420,
          textAlign: "center",
          border: "1px solid #333",
        }}
      >
        <h2>🎯 Focus Time</h2>

        <h3>{task.title}</h3>

        <div
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            margin: "1.5rem 0",
          }}
        >
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </div>

        <button
          onClick={onClose}
          style={{
            padding: "10px 22px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            background: "#ec4899",
            color: "white",
            fontWeight: 600,
          }}
        >
          Stop Timer
        </button>
      </div>
    </div>
  );
}