"use client";

import { CSSProperties, useState } from "react";

type Theme = {
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
};

interface Props {
  onClose: () => void;
  onSave: (title: string, duration: number) => void;
  theme: Theme;
}

export default function AddTaskModal({
  onClose,
  onSave,
  theme,
}: Props) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(25);

  const save = () => {
    if (!title.trim()) return;

    onSave(title.trim(), duration);
    setTitle("");
    setDuration(25);
  };

  return (
    <div
      onClick={onClose}
      style={backdrop}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          color: theme.text,
          width: 380,
          borderRadius: 18,
          padding: 24,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 20,
            fontSize: 24,
          }}
        >
          ✨ Add Task
        </h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task name..."
          style={{
            ...input,
            background: theme.surface,
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
        />

        <input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          style={{
            ...input,
            marginTop: 15,
            background: theme.surface,
            color: theme.text,
            border: `1px solid ${theme.border}`,
          }}
        />

        <p
          style={{
            color: theme.muted,
            fontSize: 13,
            marginTop: 6,
          }}
        >
          Duration (minutes)
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 24,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: `1px solid ${theme.border}`,
              color: theme.text,
              padding: "10px 18px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={save}
            style={{
              background: theme.accent,
              color: theme.accentText,
              border: "none",
              padding: "10px 20px",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const backdrop: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const input: CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  outline: "none",
  fontSize: 15,
  boxSizing: "border-box",
};