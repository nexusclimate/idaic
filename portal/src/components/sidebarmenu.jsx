// src/components/sidebar.jsx
import React from "react";
import {
  Cog6ToothIcon,
  HomeIcon,
  MegaphoneIcon,
  Square2StackIcon,
  TicketIcon,
} from "@heroicons/react/20/solid";

export function Sidebar({ children }) {
  return (
    <nav className="bg-white w-64 min-h-screen border-r px-4 py-6">
      {children}
    </nav>
  );
}

export function SidebarBody({ children }) {
  return <ul className="space-y-2">{children}</ul>;
}

export function SidebarSection({ children }) {
  return <div>{children}</div>;
}

export function SidebarItem({ href, current, children }) {
  return (
    <li>
      <a
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 font-semibold transition
          ${current
            ? 'bg-zinc-100 text-orange-500'
            : 'text-zinc-800 hover:bg-zinc-100'}
        `}
      >
        {children}
      </a>
    </li>
  );
}

export function SidebarLabel({ children }) {
  return <span>{children}</span>;
}