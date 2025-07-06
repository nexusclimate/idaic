// src/pages/home.jsx

import {
  Sidebar,
  SidebarBody,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from "../components/sidebar";
import {
  HomeIcon,
  Square2StackIcon,
  TicketIcon,
  MegaphoneIcon,
  Cog6ToothIcon,
} from "@heroicons/react/20/solid";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome to IDAIC</h1>
      <p className="text-lg text-gray-600 mb-4">
        Welcome to the IDAIC portal. This is your central hub for managing chapters, content, and resources.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Quick Actions</h3>
          <ul className="space-y-2">
            <li>• View recent content</li>
            <li>• Check upcoming events</li>
            <li>• Manage members</li>
          </ul>
        </div>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Recent Activity</h3>
          <ul className="space-y-2">
            <li>• New member joined</li>
            <li>• Event scheduled</li>
            <li>• Content updated</li>
          </ul>
        </div>
      </div>
    </div>
  );
}