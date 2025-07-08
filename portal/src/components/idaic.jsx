import { Avatar } from './avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from './dropdown'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
  SidebarHeading,
  SidebarDivider,
} from './sidebar'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/16/solid'
import {
  Cog6ToothIcon,
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
  TicketIcon,
  MapPinIcon,
  GlobeAltIcon,
  NewspaperIcon,
  SunIcon,
} from '@heroicons/react/20/solid'
import idaicLogo from '../../../idaic_black.png'
import { colors } from '../config/colors'
import { ComputerDesktopIcon } from '@heroicons/react/24/solid'

export default function Idaic({ onPageChange, currentPage, isAdminAuthenticated, setIsAdminAuthenticated }) {
  const handlePageChange = (page) => {
    onPageChange(page);
  };

  // Custom styles using config colors
  const sidebarItemStyle = {
    transition: 'all 0.2s ease-in-out',
  };

  // Custom current indicator style
  const currentIndicatorStyle = {
    backgroundColor: colors.primary.orange,
  };

  return (
    <nav className="h-screen w-64 bg-zinc-950 text-zinc-100 flex flex-col py-8 pl-1 pr-1" style={{ overflow: 'hidden' }}>
      {/* Logo at the top, bigger */}
      <div className="flex items-center justify-center mb-10">
        <img src={idaicLogo} alt="IDAIC Logo" className="h-24 w-auto object-contain" />
      </div>
      <Sidebar>
        <SidebarBody>
          {/* Main Section */}
          <SidebarSection>
            <SidebarHeading>Main</SidebarHeading>
            <SidebarItem 
              onClick={() => handlePageChange('home')}
              current={currentPage === 'home' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'home') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'home') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <HomeIcon />
              <SidebarLabel>Home</SidebarLabel>
            </SidebarItem>
            <SidebarItem 
              onClick={() => handlePageChange('content')}
              current={currentPage === 'content' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'content') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'content') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <Square2StackIcon />
              <SidebarLabel>Content</SidebarLabel>
            </SidebarItem>
            <SidebarItem 
              onClick={() => handlePageChange('events')}
              current={currentPage === 'events' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'events') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'events') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <TicketIcon />
              <SidebarLabel>Events</SidebarLabel>
            </SidebarItem>
            <SidebarItem 
              onClick={() => handlePageChange('projects')}
              current={currentPage === 'projects' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'projects') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'projects') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <Square2StackIcon />
              <SidebarLabel>Projects</SidebarLabel>
            </SidebarItem>
            <SidebarItem 
              onClick={() => handlePageChange('members')}
              current={currentPage === 'members' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'members') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'members') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <UserIcon />
              <SidebarLabel>Members</SidebarLabel>
            </SidebarItem>
          </SidebarSection>
          <SidebarDivider />
          {/* Chapters Section */}
          <SidebarSection>
            <SidebarHeading>Chapters</SidebarHeading>
            <SidebarItem 
              onClick={() => handlePageChange('uk')}
              current={currentPage === 'uk' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'uk') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'uk') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <MapPinIcon />
              <SidebarLabel>UK</SidebarLabel>
            </SidebarItem>
            <SidebarItem 
              onClick={() => handlePageChange('mena')}
              current={currentPage === 'mena' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'mena') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'mena') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <GlobeAltIcon />
              <SidebarLabel>MENA</SidebarLabel>
            </SidebarItem>
          </SidebarSection>
          <SidebarDivider />
          {/* Climate News Section */}
          <SidebarSection>
            <SidebarHeading>Climate News</SidebarHeading>
            <SidebarItem 
              onClick={() => handlePageChange('climate-solutions')}
              current={currentPage === 'climate-solutions' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'climate-solutions') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'climate-solutions') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <SunIcon />
              <SidebarLabel>Climate Solution News</SidebarLabel>
            </SidebarItem>
            <SidebarItem 
              onClick={() => handlePageChange('uae-climate')}
              current={currentPage === 'uae-climate' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'uae-climate') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'uae-climate') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <NewspaperIcon />
              <SidebarLabel>UAE Climate News</SidebarLabel>
            </SidebarItem>
          </SidebarSection>
          <SidebarDivider />
          {/* Extra space before Resources */}
          <div className="my-12" />
          {/* Resources Section */}
          <SidebarSection>
            <SidebarHeading>Resources</SidebarHeading>
            <SidebarItem 
              onClick={() => handlePageChange('feedback')}
              current={currentPage === 'feedback' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'feedback') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'feedback') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <LightBulbIcon />
              <SidebarLabel>Feedback</SidebarLabel>
            </SidebarItem>
            <SidebarItem 
              onClick={() => handlePageChange('changelog')}
              current={currentPage === 'changelog' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'changelog') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'changelog') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <SparklesIcon />
              <SidebarLabel>Changelog</SidebarLabel>
            </SidebarItem>
            <SidebarItem 
              onClick={() => handlePageChange('settings')}
              current={currentPage === 'settings' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'settings') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'settings') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <Cog6ToothIcon />
              <SidebarLabel>User Settings</SidebarLabel>
            </SidebarItem>
            <SidebarItem 
              onClick={() => handlePageChange('portal-admin')}
              current={currentPage === 'portal-admin' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'portal-admin') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'portal-admin') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <ComputerDesktopIcon className="h-6 w-6 text-orange-500" />
              <SidebarLabel>Portal Admin</SidebarLabel>
            </SidebarItem>
          </SidebarSection>
        </SidebarBody>
        


        {/* Log out at the bottom */}
        <div className="mt-auto">
          <SidebarSection>
            <SidebarItem 
              onClick={() => { window.location.href = 'https://login.nexusclimate.co'; }}
              current={currentPage === 'logout' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'logout') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'logout') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
            >
              <ArrowRightStartOnRectangleIcon />
              <SidebarLabel>Sign out</SidebarLabel>
            </SidebarItem>
          </SidebarSection>
        </div>
      </Sidebar>
    </nav>
  )
}