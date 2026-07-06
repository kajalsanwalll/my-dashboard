"use client";

export type Task = {
  id: number;
  title: string;
  duration: number;
  completed: boolean;
};

interface Props {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onStart: (task: Task) => void;
}

export default function TaskCard({
  task,
  onToggle,
  onDelete,
  onStart,
}: Props) {
  return (
    <div
      style={{
        background: "#141414",
        border: "1px solid #2a2a2a",
        borderRadius: 14,
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          style={{
            width: 18,
            height: 18,
            cursor: "pointer",
          }}
        />

        <div>
          <h3
            style={{
              margin: 0,
              color: task.completed ? "#777" : "#fff",
              textDecoration: task.completed ? "line-through" : "none",
              fontWeight: 600,
            }}
          >
            {task.title}
          </h3>

          <p
            style={{
              margin: "4px 0 0",
              color: "#777",
              fontSize: 13,
            }}
          >
            ⏱ {task.duration} min
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        {!task.completed && (
          <button
            onClick={() => onStart(task)}
            style={{
              background: "#ec4899",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ▶ Start
          </button>
        )}

        <button
          onClick={() => onDelete(task.id)}
          style={{
            background: "#242424",
            color: "#ff6b6b",
            border: "1px solid #333",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          🗑
        </button>
      </div>
    </div>
  );
}