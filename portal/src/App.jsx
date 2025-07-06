import "./index.css";
import React from "react";
import Example from "./components/example"; // No .jsx needed

export default function App() {
  return (
    <div className="flex min-h-screen">
      <Example />
      {/* Optional: Add a main content area here */}
      <main className="flex-1 bg-white p-10">
        <h1 className="text-3xl font-bold">Welcome</h1>
      </main>
    </div>
  );
}