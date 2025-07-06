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
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar>
        <SidebarBody>
          <SidebarSection>
            <SidebarItem href="/" current>
              <HomeIcon className="h-5 w-5" />
              <SidebarLabel>Home</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/events">
              <Square2StackIcon className="h-5 w-5" />
              <SidebarLabel>Events</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/orders">
              <TicketIcon className="h-5 w-5" />
              <SidebarLabel>Orders</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/broadcasts">
              <MegaphoneIcon className="h-5 w-5" />
              <SidebarLabel>Broadcasts</SidebarLabel>
            </SidebarItem>
            <SidebarItem href="/settings">
              <Cog6ToothIcon className="h-5 w-5" />
              <SidebarLabel>Settings</SidebarLabel>
            </SidebarItem>
          </SidebarSection>
        </SidebarBody>
      </Sidebar>
      {/* Right side: leave empty or put your main content here */}
      <main className="flex-1" />
    </div>
  );
}