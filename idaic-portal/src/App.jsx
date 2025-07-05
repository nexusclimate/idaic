import './index.css'                                   // keep Tailwind
import { SidebarLayout }   from './layouts/sidebar-layout'
import { Sidebar,
         SidebarBody,
         SidebarSection,
         SidebarItem }     from './components/sidebar'
import { Navbar }          from './components/navbar'

export default function App() {
  return (
    <SidebarLayout
      navbar={<Navbar>IDAIC Portal</Navbar>}            // top bar (mobile)
      sidebar={(
        <Sidebar>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem current>Dashboard</SidebarItem>
              <SidebarItem>Projects</SidebarItem>
              <SidebarItem>Settings</SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      )}
    >
      {/* page content */}
      <div className="p-8">
        <h1 className="text-3xl font-bold">Hello Catalyst 🎉</h1>
      </div>
    </SidebarLayout>
  )
}