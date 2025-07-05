// src/App.jsx
import { useState } from 'react'
import SidebarLayout from './components/sidebarlayout'   // Catalyst layout
import './index.css'                                  // ← keep Tailwind styles

/* --- stub pages you’ll swap out later --- */
const Dashboard = () => <h1 className="p-8 text-2xl">Dashboard</h1>
const Content   = () => <h1 className="p-8 text-2xl">Content</h1>
const Projects  = () => <h1 className="p-8 text-2xl">Projects</h1>

export default function App() {
  const [page, setPage] = useState('dashboard')      // current page state

  return (
    <SidebarLayout setPage={setPage}>
      {page === 'dashboard' && <Dashboard />}
      {page === 'content'   && <Content   />}
      {page === 'projects'  && <Projects  />}
    </SidebarLayout>
  )
}