import { useState, useEffect } from 'react';
import { colors } from '../config/colors';

const tabs = [
  { name: 'Personal Info', key: 'personal' },
  { name: 'Notifications', key: 'notifications' },
];

export default function Settings({ user }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Existing user fields from users table
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [region, setRegion] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

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

  // Load user data and existing profile on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Set email from authenticated user
        setEmail(user.email || '');
        
        // Try to load existing profile data
        try {
          const response = await fetch(`/.netlify/functions/userProfile?email=${encodeURIComponent(user.email)}`);
          if (response.ok) {
            const profileData = await response.json();
            if (profileData) {
              // Populate form with existing data
              setName(profileData.name || '');
              setRole(profileData.role || '');
              setCompany(profileData.company || '');
              setTitle(profileData.title || '');
              setRegion(profileData.region || '');
              setLinkedinUrl(profileData.linkedin_url || '');
              setCategory(profileData.category || '');
              setOtherCategory(profileData.otherCategory || '');
              setOrganizationDescription(profileData.organizationDescription || '');
              setAiDecarbonisation(profileData.aiDecarbonisation || '');
              setChallenges(profileData.challenges || '');
              setContribution(profileData.contribution || '');
              setProjects(profileData.projects || '');
              setShareProjects(profileData.shareProjects || '');
              setAiTools(profileData.aiTools || '');
              setContent(profileData.content || '');
              setApproval(profileData.approval || false);
            }
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
        }
      }
      setLoading(false);
    };

    loadUserData();
  }, [user]);

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
      user_id: user?.id, // Link to authenticated user
      role,
      company,
      title,
      region,
      linkedinUrl,
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

  if (loading) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Section Heading with Tabs (left-aligned, consistent with other pages) */}
      <div className="mb-4 border-b border-gray-200">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">User Settings</h1>
          <nav className="mt-2 sm:mt-0">
            <ul className="flex space-x-4" role="tablist">
              {tabs.map(tab => (
                <li key={tab.key}>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none ${
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
      <div className="max-w-7xl mx-auto bg-white shadow rounded-lg p-4">
        {activeTab === 'personal' && (
          <>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              {/* Personal Information */}
              <div className="border-b border-gray-200 pb-3 mb-3">
                <h3 className="text-base font-medium text-gray-900 mb-2">Personal Information</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input id="name" name="name" type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      autoComplete="email" 
                      value={email} 
                      readOnly
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-500 bg-gray-50 text-sm" 
                    />
                    <p className="mt-1 text-xs text-gray-500">Email is linked to your login account and cannot be changed here.</p>
                  </div>
                  <div>
                    <label htmlFor="title" className="block text-xs font-medium text-gray-700 mb-1">Title/Position</label>
                    <input id="title" name="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                    <input id="company" name="company" type="text" value={company} onChange={e => setCompany(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-xs font-medium text-gray-700 mb-1">Region</label>
                    <input id="region" name="region" type="text" value={region} onChange={e => setRegion(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm" />
                  </div>
                  <div>
                    <label htmlFor="linkedinUrl" className="block text-xs font-medium text-gray-700 mb-1">LinkedIn URL</label>
                    <input id="linkedinUrl" name="linkedinUrl" type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm" placeholder="https://linkedin.com/in/yourprofile" />
                  </div>
                </div>
              </div>

              {/* Organization Information - Split into two columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-3">
                  <h3 className="text-base font-medium text-gray-900 mb-2">Organization Information</h3>

                  <div>
                    <label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">What Category fits best:</label>
                    <select
                      id="category"
                      name="category"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm"
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
                      <label htmlFor="otherCategory" className="block text-xs font-medium text-gray-700 mb-1">Please specify:</label>
                      <input
                        id="otherCategory"
                        name="otherCategory"
                        type="text"
                        value={otherCategory}
                        onChange={e => setOtherCategory(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm"
                        placeholder="Specify your category"
                      />
                    </div>
                  )}

                  <div>
                      <label htmlFor="organizationDescription" className="block text-xs font-medium text-gray-700 mb-1">What does the organization you represent do?</label>
                    <textarea
                      id="organizationDescription"
                      name="organizationDescription"
                      rows={2}
                      value={organizationDescription}
                      onChange={e => setOrganizationDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm"
                      placeholder="Describe your organization's activities"
                    />
                  </div>

                  <div>
                    <label htmlFor="aiDecarbonisation" className="block text-xs font-medium text-gray-700 mb-1">In what ways are you exploring or planning to use AI to accelerate decarbonisation within your organization?</label>
                    <textarea
                      id="aiDecarbonisation"
                      name="aiDecarbonisation"
                      rows={2}
                      value={aiDecarbonisation}
                      onChange={e => setAiDecarbonisation(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm"
                      placeholder="Describe your AI decarbonisation plans"
                    />
                  </div>

                  <div>
                    <label htmlFor="challenges" className="block text-xs font-medium text-gray-700 mb-1">What industrial decarbonisation challenges would you like to address through AI?</label>
                    <textarea
                      id="challenges"
                      name="challenges"
                      rows={2}
                      value={challenges}
                      onChange={e => setChallenges(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm"
                      placeholder="Describe the challenges you want to address"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <h3 className="text-base font-medium text-gray-900">&nbsp;</h3> {/* Spacer for alignment */}

                  <div>
                    <label htmlFor="contribution" className="block text-xs font-medium text-gray-700 mb-1">How might you contribute to addressing those challenges?</label>
                    <textarea
                      id="contribution"
                      name="contribution"
                      rows={2}
                      value={contribution}
                      onChange={e => setContribution(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm"
                      placeholder="Describe how you can contribute"
                    />
                  </div>

                  <div>
                    <label htmlFor="projects" className="block text-xs font-medium text-gray-700 mb-1">Are you currently working on any projects—either in progress or recently completed—that you would like to showcase on our website?</label>
                    <textarea
                      id="projects"
                      name="projects"
                      rows={2}
                      value={projects}
                      onChange={e => setProjects(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm"
                      placeholder="Describe your projects"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Would you be open to sharing them for visibility or potential collaboration opportunities?</label>
                    <div className="flex gap-4 mt-1">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="shareProjects"
                          value="yes"
                          checked={shareProjects === 'yes'}
                          onChange={e => setShareProjects(e.target.value)}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm">Yes</span>
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
                        <span className="ml-2 text-sm">No</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="aiTools" className="block text-xs font-medium text-gray-700 mb-1">Are there specific AI tools or approaches you're interested in or developing?</label>
                    <textarea
                      id="aiTools"
                      name="aiTools"
                      rows={2}
                      value={aiTools}
                      onChange={e => setAiTools(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm"
                      placeholder="Describe AI tools or approaches"
                    />
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-xs font-medium text-gray-700 mb-1">Do you have a case study, perspective article or other content you could provide for the next meeting and/or the members portal?</label>
                    <textarea
                      id="content"
                      name="content"
                      rows={2}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-1.5 px-2 text-gray-900 focus:border-orange-500 focus:ring-orange-500 text-sm"
                      placeholder="Describe available content"
                    />
                  </div>
                </div>
              </div>

              {/* Approval */}
              <div className="border-b border-gray-200 pb-2 pt-1">
                <div className="flex items-start">
                  <div className="flex items-center h-4">
                    <input
                      id="approval"
                      name="approval"
                      type="checkbox"
                      checked={approval}
                      onChange={e => setApproval(e.target.checked)}
                      className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-2 text-xs">
                    <label htmlFor="approval" className="font-medium text-gray-700">
                      I agree that IDAIC have permission to process my data and host this information on the member section of the IDAIC website
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-orange-500 py-1.5 px-3 text-sm font-medium text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Submit Information
                </button>
              </div>
            </form>
          </>
        )}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Notifications</h2>
            <p className="text-gray-500 text-sm">Notification preferences coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
} 