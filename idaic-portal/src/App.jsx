// src/App.jsx
import { useState } from 'react'
import { Sidebar } from './components/sidebar'
import { Navbar }  from './components/navbar'
import SidebarLayout from './components/sidebarlayout'      // path now matches your file
import './index.css'  

/* --- stub pages you’ll swap out later --- */
const Dashboard = () => <h1 className="p-8 text-2xl">Dashboard</h1>
const Content   = () => <h1 className="p-8 text-2xl">Content</h1>
const Projects  = () => <h1 className="p-8 text-2xl">Projects</h1>

export default function App() {
  return (
    <SidebarLayout sidebar={<Sidebar />} navbar={<Navbar />}>
      {/* Your page routes or default dashboard go here */}
      <h1 className="text-2xl font-bold">Welcome to IDAIC Portal</h1>
    </SidebarLayout>
  )
}