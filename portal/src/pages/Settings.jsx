import { useState } from 'react';
import { colors } from '../config/colors';

const tabs = [
  { name: 'Personal Info', key: 'personal' },
  { name: 'Notifications', key: 'notifications' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('personal');
  const [name, setName] = useState('Jane Doe');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [photo, setPhoto] = useState(null);

  // Organization form fields
  const [category, setCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [aiDecarbonisation, setAiDecarbonisation] = useState('');
  const [challenges, setChallenges] = useState('');
  const [contribution, setContribution] = useState('');
  const [projects, setProjects] = useState('');
  const [shareProjects, setShareProjects] = useState('');
  const [aiTools, setAiTools] = useState('');
  const [content, setContent] = useState('');
  const [approval, setApproval] = useState(false);

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!name || !email) {
      alert('Name and email are required.');
      return;
    }

    if (!approval) {
      alert('Please check the approval checkbox to continue.');
      return;
    }

    if (category === 'Other' && !otherCategory.trim()) {
      alert('Please specify your category when selecting "Other".');
      return;
    }

    const formData = {
      name,
      email,
      category,
      otherCategory: category === 'Other' ? otherCategory : '',
      organizationDescription,
      aiDecarbonisation,
      challenges,
      contribution,
      projects,
      shareProjects,
      aiTools,
      content,
      approval
    };

    try {
      // Submit to database
      const response = await fetch('/.netlify/functions/userProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit profile');
      }

      const result = await response.json();

      alert(result.message || 'Form submitted successfully! Your information will be reviewed.');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  return (
    <div className="py-6">
      {/* Section Heading with Tabs (left-aligned, consistent with other pages) */}
      <div className="mb-6 border-b border-gray-200">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">User Settings</h1>
          <nav className="mt-4 sm:mt-0">
            <ul className="flex space-x-4" role="tablist">
              {tabs.map(tab => (
                <li key={tab.key}>
                  <button
                    type="button"
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none ${
                      activeTab === tab.key
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    style={activeTab === tab.key ? { color: colors.primary.orange, borderColor: colors.primary.orange } : {}}
                    onClick={() => setActiveTab(tab.key)}
                    role="tab"
                    aria-selected={activeTab === tab.key}
                  >
                    {tab.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      {/* Tab Content */}
      <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
        {activeTab === 'personal' && (
          <>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input id="name" name="name" type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                    <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                  </div>
                </div>
              </div>

              {/* Organization Information - Split into two columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Organization Information</h3>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">What Category fits best:</label>
                    <select
                      id="category"
                      name="category"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    >
                      <option value="">Select a category</option>
                      <option value="Represent industrial company">Represent industrial company</option>
                      <option value="Represent AI developer / provider">Represent AI developer / provider</option>
                      <option value="Represent research centre / university">Represent research centre / university</option>
                      <option value="Represent investor">Represent investor</option>
                      <option value="Other">Other: (please specify)</option>
                    </select>
                  </div>

                  {category === 'Other' && (
                    <div>
                      <label htmlFor="otherCategory" className="block text-sm font-medium text-gray-700 mb-2">Please specify:</label>
                      <input
                        id="otherCategory"
                        name="otherCategory"
                        type="text"
                        value={otherCategory}
                        onChange={e => setOtherCategory(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        placeholder="Specify your category"
                      />
                    </div>
                  )}

                  <div>
                      <label htmlFor="organizationDescription" className="block text-sm font-medium text-gray-700 mb-1">What does the organization you represent do?</label>
                    <textarea
                      id="organizationDescription"
                      name="organizationDescription"
                      rows={3}
                      value={organizationDescription}
                      onChange={e => setOrganizationDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="Describe your organization's activities"
                    />
                  </div>

                  <div>
                    <label htmlFor="aiDecarbonisation" className="block text-sm font-medium text-gray-700 mb-1">In what ways are you exploring or planning to use AI to accelerate decarbonisation within your organization?</label>
                    <textarea
                      id="aiDecarbonisation"
                      name="aiDecarbonisation"
                      rows={3}
                      value={aiDecarbonisation}
                      onChange={e => setAiDecarbonisation(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="Describe your AI decarbonisation plans"
                    />
                  </div>

                  <div>
                    <label htmlFor="challenges" className="block text-sm font-medium text-gray-700 mb-1">What industrial decarbonisation challenges would you like to address through AI?</label>
                    <textarea
                      id="challenges"
                      name="challenges"
                      rows={3}
                      value={challenges}
                      onChange={e => setChallenges(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="Describe the challenges you want to address"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">&nbsp;</h3> {/* Spacer for alignment */}

                  <div>
                    <label htmlFor="contribution" className="block text-sm font-medium text-gray-700 mb-2">How might you contribute to addressing those challenges?</label>
                    <textarea
                      id="contribution"
                      name="contribution"
                      rows={3}
                      value={contribution}
                      onChange={e => setContribution(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="Describe how you can contribute"
                    />
                  </div>

                  <div>
                    <label htmlFor="projects" className="block text-sm font-medium text-gray-700 mb-2">Are you currently working on any projects—either in progress or recently completed—that you would like to showcase on our website?</label>
                    <textarea
                      id="projects"
                      name="projects"
                      rows={3}
                      value={projects}
                      onChange={e => setProjects(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="Describe your projects"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Would you be open to sharing them for visibility or potential collaboration opportunities?</label>
                    <div className="flex gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="shareProjects"
                          value="yes"
                          checked={shareProjects === 'yes'}
                          onChange={e => setShareProjects(e.target.value)}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="ml-2">Yes</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="shareProjects"
                          value="no"
                          checked={shareProjects === 'no'}
                          onChange={e => setShareProjects(e.target.value)}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="ml-2">No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="aiTools" className="block text-sm font-medium text-gray-700 mb-2">Are there specific AI tools or approaches you're interested in or developing?</label>
                    <textarea
                      id="aiTools"
                      name="aiTools"
                      rows={3}
                      value={aiTools}
                      onChange={e => setAiTools(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="Describe AI tools or approaches"
                    />
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Do you have a case study, perspective article or other content you could provide for the next meeting and/or the members portal?</label>
                    <textarea
                      id="content"
                      name="content"
                      rows={3}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="Describe available content"
                    />
                  </div>
                </div>
              </div>

              {/* Approval */}
              <div className="border-b border-gray-200 pb-3 pt-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="approval"
                      name="approval"
                      type="checkbox"
                      checked={approval}
                      onChange={e => setApproval(e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="approval" className="font-medium text-gray-700">
                      I agree that IDAIC have permission to process my data and host this information on the member section of the IDAIC website
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-orange-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Submit Information
                </button>
              </div>
            </form>
          </>
        )}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Notifications</h2>
            <p className="text-gray-500">Notification preferences coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
} 