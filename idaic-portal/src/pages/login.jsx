import React, { useState } from 'react'
import { AuthLayout } from '../layouts/auth-layout'

export default function Login() {
  const [step, setStep] = useState('request') // 'request' or 'verify'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  // Placeholder for real OTP logic
  const handleRequestOtp = (e) => {
    e.preventDefault()
    // TODO: Call your Supabase/OTP API here
    setStep('verify')
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    // TODO: Verify code logic
    alert('Logged in! (Replace with real redirect)')
  }

  return (
    <AuthLayout>
      <h2 className="text-center text-2xl font-bold">IDAIC Members</h2>
      {/* ① Request OTP */}
      {step === 'request' && (
        <form className="space-y-5" onSubmit={handleRequestOtp}>
          <div>
            <label htmlFor="email" className="block mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-[#2b2b2b] border border-[#DCDCDC] text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#FF9900] hover:bg-orange-600 text-black rounded-lg font-semibold"
          >
            Send code
          </button>
        </form>
      )}
      {/* ② Verify OTP */}
      {step === 'verify' && (
        <form className="space-y-5" onSubmit={handleVerifyOtp}>
          <div>
            <label htmlFor="code" className="block mb-1">Enter code</label>
            <input
              id="code"
              type="text"
              maxLength={6}
              required
              className="w-full px-4 py-2 rounded-lg bg-[#2b2b2b] border border-[#DCDCDC] text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-[#FF9900] hover:bg-orange-600 text-black rounded-lg font-semibold"
          >
            Verify &amp; Sign in
          </button>
        </form>
      )}

      <div className="flex items-center justify-center">
        <span className="text-[#DCDCDC] text-sm">or</span>
      </div>
      <div>
        <a
          href="/main.html"
          className="w-full block text-center py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
        >
          Login as Admin
        </a>
      </div>
    </AuthLayout>
  )
}