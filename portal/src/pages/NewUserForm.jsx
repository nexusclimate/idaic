import { useState } from 'react';
import { colors, font } from '../config/colors';
import { ErrorMessage, SuccessMessage } from '../components/ErrorMessage';
import idaicLogo from '../../../idaic_black.png';

const REGIONS = ['UK', 'UAE', 'EU', 'MENA', 'Global'];

export default function NewUserForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    title: '',
    region: '',
    linkedin_url: '',
    data_permission: false,
    category: '',
    other_category: '',
    organization_description: '',
    ai_decarbonisation: '',
    challenges: '',
    contribution: '',
    projects: '',
    ai_tools: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      // Validate category field
      if (formData.category === 'Other' && !formData.other_category.trim()) {
        setError('Please specify your category when selecting "Other".');
        setSubmitting(false);
        return;
      }

      // Map form fields to API format
      const payload = {
        name: formData.name,
        email: formData.email,
        company: formData.company,
        title: formData.title,
        region: formData.region,
        linkedin_url: formData.linkedin_url,
        data_permission: formData.data_permission,
        category: formData.category,
        other_category: formData.category === 'Other' ? formData.other_category : '',
        organization_description: formData.organization_description,
        ai_decarbonisation: formData.ai_decarbonisation,
        challenges: formData.challenges,
        contribution: formData.contribution,
        projects: formData.projects,
        ai_tools: formData.ai_tools,
        approved: false // Set approved to false for new public form submissions
      };

      const response = await fetch('/.netlify/functions/userProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit form');
      }

      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        title: '',
        region: '',
        linkedin_url: '',
        data_permission: false,
        category: '',
        other_category: '',
        organization_description: '',
        ai_decarbonisation: '',
        challenges: '',
        contribution: '',
        projects: '',
        ai_tools: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" style={{ fontFamily: font.primary }}>
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={idaicLogo} alt="IDAIC Logo" className="h-20 w-auto object-contain" />
        </div>

        {/* Opening Notice */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6">
          <h2 className="text-lg font-semibold mb-3" style={{ color: colors.text.primary }}>
            Notice - members portal
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: colors.text.secondary }}>
            We're currently creating our members portal to include more detailed member profiles and a library showcasing members' ongoing or completed projects. This will help other members better understand your work and potentially reach out for collaboration through our platform. Projects seeking collaboration with industry partners or AI technology experts will be specially tagged.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.text.primary }}>
            IDAIC Member Registration
          </h1>

          {success && (
            <SuccessMessage message="Thank you for your submission! Your profile will be reviewed for approval." />
          )}
          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b pb-6">
              <h3 className="text-base font-semibold mb-4" style={{ color: colors.text.primary }}>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Title/Position
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Region
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="">Select Region</option>
                    {REGIONS.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>
            </div>

            {/* Data Permission */}
            <div className="border-b pb-6">
              <h3 className="text-base font-semibold mb-2" style={{ color: colors.text.primary }}>
                Data Permission
              </h3>
              <p className="text-sm mb-3" style={{ color: colors.text.secondary }}>
                User consent to display their information on the member section
              </p>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.data_permission}
                  onChange={(e) => setFormData({ ...formData, data_permission: e.target.checked })}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="ml-2 text-sm" style={{ color: colors.text.primary }}>
                  I agree that IDAIC have permission to process my data and host this information on the member section of the IDAIC website
                </span>
              </label>
            </div>

            {/* Additional Information */}
            <div className="border-b pb-6">
              <h3 className="text-base font-semibold mb-4" style={{ color: colors.text.primary }}>
                Additional Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    What Category fits best:
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value, other_category: e.target.value === 'Other' ? formData.other_category : '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    <option value="">Select a category</option>
                    <option value="Represent industrial company">Represent industrial company</option>
                    <option value="Represent AI developer / provider">Represent AI developer / provider</option>
                    <option value="Represent research centre / university">Represent research centre / university</option>
                    <option value="Represent investor">Represent investor</option>
                    <option value="Other">Other: (please specify)</option>
                  </select>
                </div>

                {formData.category === 'Other' && (
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                      Please specify:
                    </label>
                    <input
                      type="text"
                      value={formData.other_category}
                      onChange={(e) => setFormData({ ...formData, other_category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Specify your category"
                      required={formData.category === 'Other'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    What does the organization you represent do?
                  </label>
                  <textarea
                    value={formData.organization_description}
                    onChange={(e) => setFormData({ ...formData, organization_description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    In what ways are you exploring or planning to use AI to accelerate decarbonisation within your organization?
                  </label>
                  <textarea
                    value={formData.ai_decarbonisation}
                    onChange={(e) => setFormData({ ...formData, ai_decarbonisation: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    What are the key challenges you face in implementing AI for decarbonisation?
                  </label>
                  <textarea
                    value={formData.challenges}
                    onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    How might you contribute to addressing those challenges?
                  </label>
                  <textarea
                    value={formData.contribution}
                    onChange={(e) => setFormData({ ...formData, contribution: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Are there any specific projects or initiatives you would like to share with the community?
                  </label>
                  <textarea
                    value={formData.projects}
                    onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    What AI tools and technologies are you currently using or planning to use?
                  </label>
                  <textarea
                    value={formData.ai_tools}
                    onChange={(e) => setFormData({ ...formData, ai_tools: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-orange-500 text-white rounded-md text-base font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
            Disclaimer
          </h2>
          <div className="text-sm space-y-3" style={{ color: colors.text.secondary }}>
            <p>
              This form is managed by Nexus Climate. By submitting this form you agree that Nexus Climate will store and process the information you submit for the purpose of administering your participation in IDAIC and managing related activities. You agree that your information will be shared with the IDAIC team, Cleantech for UK, and Innovate UK for the purposes of running the coalition and its activities.
            </p>
            <p>
              You can unsubscribe from these communications at any time by contacting info@nexusclimate.vc
            </p>
            <p className="italic text-xs" style={{ color: colors.text.secondary }}>
              Nexus Climate is the trading name of Nexus Climate LTD, a company incorporated in England and Wales with company number 15267106, and Nexus Climate Consultancy Ltd, registered in the Dubai International Financial Center (DIFC), Dubai, UAE, under registration number 425675 and licence number CL8040. For more details on how we handle your personal data, please review our{' '}
              <a 
                href="https://nexusclimate.vc/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 underline"
              >
                Privacy Policy
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

