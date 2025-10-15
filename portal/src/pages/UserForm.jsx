import { useState } from 'react';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';

export default function UserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    region: '',
    data_permission: '',
    organizationDescription: '',
    aiDecarbonisation: '',
    challenges: '',
    contribution: '',
    projects: '',
    aiTools: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const REGIONS = ['UK', 'UAE', 'EU', 'MENA', 'Global'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/.netlify/functions/userProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit form');
      }

      setSuccess('Form submitted successfully');
      setFormData({
        name: '',
        email: '',
        company: '',
        region: '',
        data_permission: '',
        organizationDescription: '',
        aiDecarbonisation: '',
        challenges: '',
        contribution: '',
        projects: '',
        aiTools: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">User Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-900">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-900">
            Organization Name
          </label>
          <input
            type="text"
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-900">
            Region
          </label>
          <select
            id="region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
          >
            <option value="">Select Region</option>
            {REGIONS.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="data_permission" className="block text-sm font-medium text-gray-900">
            Data Permission
          </label>
          <select
            id="data_permission"
            value={formData.data_permission}
            onChange={(e) => setFormData({ ...formData, data_permission: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer"
          >
            <option value="">Select Option</option>
            <option value="yes">Yes, I Agree</option>
            <option value="no">No, I Decline</option>
          </select>
          <p className="mt-2 text-sm text-gray-500">
            I agree that IDAIC have permission to process my data and host this information on the member section of the IDAIC website
          </p>
        </div>

        <div>
          <label htmlFor="organizationDescription" className="block text-sm font-medium text-gray-900">
            Please provide a brief description of your organization and its activities
          </label>
          <textarea
            id="organizationDescription"
            value={formData.organizationDescription}
            onChange={(e) => setFormData({ ...formData, organizationDescription: e.target.value })}
            rows="4"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="aiDecarbonisation" className="block text-sm font-medium text-gray-900">
            In what ways are you exploring or planning to use AI to accelerate decarbonisation within your organization?
          </label>
          <textarea
            id="aiDecarbonisation"
            value={formData.aiDecarbonisation}
            onChange={(e) => setFormData({ ...formData, aiDecarbonisation: e.target.value })}
            rows="4"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="challenges" className="block text-sm font-medium text-gray-900">
            What are the key challenges you face in implementing AI for decarbonisation?
          </label>
          <textarea
            id="challenges"
            value={formData.challenges}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            rows="4"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="contribution" className="block text-sm font-medium text-gray-900">
            How do you see your organization contributing to and benefiting from the IDAIC community?
          </label>
          <textarea
            id="contribution"
            value={formData.contribution}
            onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
            rows="4"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="projects" className="block text-sm font-medium text-gray-900">
            Are there any specific projects or initiatives you would like to share with the community?
          </label>
          <textarea
            id="projects"
            value={formData.projects}
            onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
            rows="4"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div>
          <label htmlFor="aiTools" className="block text-sm font-medium text-gray-900">
            What AI tools and technologies are you currently using or planning to use?
          </label>
          <textarea
            id="aiTools"
            value={formData.aiTools}
            onChange={(e) => setFormData({ ...formData, aiTools: e.target.value })}
            rows="4"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-orange-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
