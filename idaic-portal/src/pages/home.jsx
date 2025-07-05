import {
  Sidebar,
  SidebarBody,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '../components/sidebar';
import {
  Cog6ToothIcon,
  HomeIcon,
  MegaphoneIcon,
  Square2StackIcon,
  TicketIcon,
} from '@heroicons/react/20/solid';

export default function HomeSidebar() {
  return (
    <Sidebar>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/" current>
            <HomeIcon className="size-5" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/events">
            <Square2StackIcon className="size-5" />
            <SidebarLabel>Events</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/orders">
            <TicketIcon className="size-5" />
            <SidebarLabel>Orders</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/broadcasts">
            <MegaphoneIcon className="size-5" />
            <SidebarLabel>Broadcasts</SidebarLabel>
          </SidebarItem>

          <SidebarItem href="/settings">
            <Cog6ToothIcon className="size-5" />
            <SidebarLabel>Settings</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  );
}