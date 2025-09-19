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
  BookOpenIcon,
} from '@heroicons/react/20/solid'
import idaicLogo from '../../../idaic_black.png'
import { colors } from '../config/colors'
import { ComputerDesktopIcon } from '@heroicons/react/24/solid'
import { supabase } from '../config/supabase.js'
import React, { useState, useEffect } from 'react'

export default function Idaic({ onPageChange, currentPage, isAdminAuthenticated, setIsAdminAuthenticated }) {
  // Detect mobile and set collapsed true by default on mobile
  const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
  const [collapsed, setCollapsed] = useState(isMobile);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handler = () => {
        setCollapsed(window.matchMedia('(max-width: 640px)').matches);
      };
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    }
  }, []);
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
    <nav
      className={`h-screen ${collapsed ? 'w-16' : 'w-56'} bg-zinc-950 text-zinc-100 flex flex-col py-4 pl-1 pr-1 transition-all duration-300`}
      style={{ overflow: 'hidden' }}
    >
      {/* Logo at the top, smaller margin */}
      <div className={`flex items-center justify-center mb-4 transition-all duration-300 ${collapsed ? 'h-12' : 'h-20'}`}>
        <button
          type="button"
          onClick={() => handlePageChange('home')}
          className="focus:outline-none"
          aria-label="Go to home page"
          style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
        >
          <img src={idaicLogo} alt="IDAIC Logo" className={`${collapsed ? 'h-10' : 'h-20'} w-auto object-contain transition-all duration-300`} />
        </button>
      </div>
      <Sidebar>
        <SidebarBody>
          {/* Main Section */}
          <SidebarSection>
            {!collapsed && (
              <SidebarHeading className="mb-0.5 px-2 text-xs/6 font-medium text-zinc-400" style={{ marginBottom: 2 }}>Main</SidebarHeading>
            )}
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
              title={collapsed ? 'Home' : undefined}
            >
              <HomeIcon />
              {!collapsed && <SidebarLabel>Home</SidebarLabel>}
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
              title={collapsed ? 'Content' : undefined}
            >
              <Square2StackIcon />
              {!collapsed && <SidebarLabel>Content</SidebarLabel>}
            </SidebarItem>
            <SidebarItem 
              onClick={() => handlePageChange('case-studies')}
              current={currentPage === 'case-studies' ? true : undefined}
              style={sidebarItemStyle}
              onMouseEnter={(e) => {
                if (currentPage !== 'case-studies') {
                  e.currentTarget.style.backgroundColor = colors.primary.orangeHover;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'case-studies') {
                  e.currentTarget.style.backgroundColor = '';
                }
              }}
              title={collapsed ? 'Case Studies' : undefined}
            >
              <BookOpenIcon />
              {!collapsed && <SidebarLabel>Case Studies</SidebarLabel>}
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
              title={collapsed ? 'Events' : undefined}
            >
              <TicketIcon />
              {!collapsed && <SidebarLabel>Events</SidebarLabel>}
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
              title={collapsed ? 'Projects' : undefined}
            >
              <Square2StackIcon />
              {!collapsed && <SidebarLabel>Projects</SidebarLabel>}
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
              title={collapsed ? 'Members' : undefined}
            >
              <UserIcon />
              {!collapsed && <SidebarLabel>Members</SidebarLabel>}
            </SidebarItem>
          </SidebarSection>
          <SidebarDivider className="my-2" />
          {/* Chapters Section */}
          <SidebarSection>
            {!collapsed && (
              <SidebarHeading className="mb-0.5 px-2 text-xs/6 font-medium text-zinc-400" style={{ marginBottom: 2 }}>Chapters</SidebarHeading>
            )}
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
              title={collapsed ? 'UK' : undefined}
            >
              <MapPinIcon />
              {!collapsed && <SidebarLabel>UK</SidebarLabel>}
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
              title={collapsed ? 'MENA' : undefined}
            >
              <GlobeAltIcon />
              {!collapsed && <SidebarLabel>MENA</SidebarLabel>}
            </SidebarItem>
          </SidebarSection>
          <SidebarDivider className="my-2" />
          {/* Climate News Section */}
          <SidebarSection>
            {!collapsed && (
              <SidebarHeading className="mb-0.5 px-2 text-xs/6 font-medium text-zinc-400" style={{ marginBottom: 2 }}>Climate News</SidebarHeading>
            )}
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
              title={collapsed ? 'CSN' : undefined}
            >
              <SunIcon />
              {!collapsed && <SidebarLabel>CSN</SidebarLabel>}
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
              title={collapsed ? 'UAE' : undefined}
            >
              <NewspaperIcon />
              {!collapsed && <SidebarLabel>UAE</SidebarLabel>}
            </SidebarItem>
          </SidebarSection>
          <SidebarDivider className="my-2" />
          {/* Resources Section */}
          <SidebarSection>
            {!collapsed && (
              <SidebarHeading className="mb-0.5 px-2 text-xs/6 font-medium text-zinc-400" style={{ marginBottom: 2 }}>Resources</SidebarHeading>
            )}
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
              title={collapsed ? 'Feedback' : undefined}
            >
              <LightBulbIcon />
              {!collapsed && <SidebarLabel>Feedback</SidebarLabel>}
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
              title={collapsed ? 'Changelog' : undefined}
            >
              <SparklesIcon />
              {!collapsed && <SidebarLabel>Changelog</SidebarLabel>}
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
              title={collapsed ? 'User Settings' : undefined}
            >
              <Cog6ToothIcon />
              {!collapsed && <SidebarLabel>User Settings</SidebarLabel>}
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
              title={collapsed ? 'Portal Admin' : undefined}
            >
              <ComputerDesktopIcon className="h-6 w-6 text-orange-500" />
              {!collapsed && <SidebarLabel>Portal Admin</SidebarLabel>}
            </SidebarItem>
          </SidebarSection>
        </SidebarBody>
        
        {/* Bottom section with toggle and logout */}
        <div className="mt-auto px-2 pb-2">
          {/* Toggle row */}
          <div className="flex items-center w-full justify-end mb-2">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="p-1 rounded hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500 text-zinc-100"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ alignSelf: 'center' }}
            >
              {collapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5l-7.5-7.5 7.5-7.5" />
                </svg>
              )}
            </button>
          </div>
          {/* Sign out row */}
          <div className="flex items-center w-full gap-2">
            <SidebarSection className="flex">
              <SidebarItem 
                onClick={async () => {
                  try {
                    // Clear admin auth state
                    if (typeof setIsAdminAuthenticated === 'function') {
                      setIsAdminAuthenticated(false);
                    }
                    
                    // Proper Supabase logout
                    console.log('🔄 Signing out from Supabase...');
                    await supabase.auth.signOut();
                    
                    // Clear localStorage (handled by auth state change listener in App.jsx)
                    localStorage.removeItem('idaic-token');
                    localStorage.removeItem('idaic-disclaimer-accepted');
                    
                    // Navigate to logout page in-app first
                    handlePageChange('logout');
                    
                    // Redirect to login page, replacing history so back button doesn't restore
                    setTimeout(() => {
                      window.location.replace('/login.html');
                    }, 500);
                  } catch (error) {
                    console.error('Error during logout:', error);
                    // Fallback: still redirect to login even if Supabase logout fails
                    localStorage.clear();
                    window.location.replace('/login.html');
                  }
                }}
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
                title={collapsed ? 'Sign out' : undefined}
              >
                <ArrowRightStartOnRectangleIcon />
                {!collapsed && <SidebarLabel>Sign out</SidebarLabel>}
              </SidebarItem>
            </SidebarSection>
          </div>
        </div>
      </Sidebar>
    </nav>
  )
}