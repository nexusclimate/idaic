import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase' // You'll need to create this

export default function EmailProcessingDashboard() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profile_submissions')
        .select(`
          id,
          email_status,
          email_sent_at,
          email_attempted_at,
          email_error,
          submitted_at,
          user_profiles (
            name,
            email,
            category
          )
        `)
        .order('submitted_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const processPendingEmails = async () => {
    setProcessing(true)
    try {
      // Option 1: Call Supabase Edge Function
      const response = await fetch('/.netlify/functions/processPendingEmails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Processed ${result.successCount} emails successfully!`)
        fetchSubmissions() // Refresh the list
      } else {
        throw new Error('Processing failed')
      }

      // Option 2: Call Supabase Edge Function directly
      /*
      const { data, error } = await supabase.functions.invoke('process-profile-emails')
      if (error) throw error
      alert(`Processed ${data.successCount} emails successfully!`)
      */

    } catch (error) {
      console.error('Error processing emails:', error)
      alert('Error processing emails. Check console for details.')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="p-6">Loading submissions...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Processing Dashboard</h1>
        <button
          onClick={processPendingEmails}
          disabled={processing}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Process Pending Emails'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {submissions.filter(s => s.email_status === 'pending').length}
          </div>
          <div className="text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {submissions.filter(s => s.email_status === 'sent').length}
          </div>
          <div className="text-gray-600">Sent</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {submissions.filter(s => s.email_status === 'failed').length}
          </div>
          <div className="text-gray-600">Failed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-600">
            {submissions.length}
          </div>
          <div className="text-gray-600">Total</div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Processed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Error
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {submission.user_profiles?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {submission.user_profiles?.email}
                    </div>
                    <div className="text-xs text-gray-400">
                      {submission.user_profiles?.category}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(submission.email_status)}`}>
                    {submission.email_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(submission.submitted_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.email_sent_at ?
                    new Date(submission.email_sent_at).toLocaleDateString() :
                    '-'
                  }
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {submission.email_error || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {submissions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No submissions found</p>
        </div>
      )}
    </div>
  )
}


