"use client";

import { useEffect } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") || "blush";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const changeTheme = (theme: string) => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  };

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen transition-colors duration-300">
          {children}
          <ThemeSwitcher changeTheme={changeTheme} />
        </div>
      </body>
    </html>
  );
}

function ThemeSwitcher({
  changeTheme,
}: {
  changeTheme: (theme: string) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 flex gap-2">
      <button onClick={() => changeTheme("blush")} className="w-6 h-6 rounded-full bg-pink-400" />
      <button onClick={() => changeTheme("lavender")} className="w-6 h-6 rounded-full bg-purple-400" />
      <button onClick={() => changeTheme("sage")} className="w-6 h-6 rounded-full bg-green-400" />
      <button onClick={() => changeTheme("dark")} className="w-6 h-6 rounded-full bg-gray-800" />
    </div>
  );
}