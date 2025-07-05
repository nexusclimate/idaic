import React from 'react'

export function AuthLayout({ children }) {
  return (
    <main className="bg-black min-h-screen flex flex-col items-center justify-start pt-16 font-['Roboto',sans-serif] text-[#FAFAFA]">
      <div className="mb-10">
        {/* You can use <Logo /> here if you want */}
        <img
          src="https://raw.githubusercontent.com/nexusclimate/idaic/main/idaic_black.png"
          alt="IDAIC Logo"
          className="h-28"
        />
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-[#1a1a1a] rounded-xl shadow-xl mt-4">
        {children}
      </div>
    </main>
  )
}