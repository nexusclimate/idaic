import Home from '../pages/home';
import Content from '../pages/Content';
import Events from '../pages/Events';
import Members from '../pages/Members';
import UKChapter from '../pages/UKChapter';
import MENAChapter from '../pages/MENAChapter';
import ClimateSolutions from '../pages/ClimateSolutions';
import UAEClimate from '../pages/UAEClimate';
import Feedback from '../pages/Feedback';
import Changelog from '../pages/Changelog';
import Admin from '../pages/Admin';
import AdminPasswordPrompt from '../components/AdminPasswordPrompt';
import Settings from '../pages/Settings';
import Projects from '../pages/projects';

export default function PageRouter({ currentPage, isAdminAuthenticated, setIsAdminAuthenticated }) {
  switch (currentPage) {
    case 'home':
      return <Home />;
    case 'content':
      return (
        <div style={{ width: '100%', height: '100%', padding: 0 }}>
          <iframe
            src="https://members.nexusclimate.co/"
            title="IDAIC Changelog"
            style={{ width: '100%', minHeight: '95vh', border: 'none', padding: 0 }}
            allowFullScreen
          />
        </div>
      );
    case 'events':
      return <Events />;
    case 'members':
      return <Members />;
    case 'uk':
      return <UKChapter />;
    case 'mena':
      return <MENAChapter />;
    case 'climate-solutions':
      return (
        <div style={{ width: '100%', height: '100%' }}>
          <iframe
            src="https://climatesolutions.news/"
            title="Climate Solutions News"
            style={{ width: '100%', minHeight: '92vh', border: 'none' }}
            allowFullScreen
          />
        </div>
      );
    case 'uae-climate':
        return (
            <div style={{ width: '100%', height: '100%' }}>
              <iframe
                src="https://news.nexusclimate.co/ae/"
                title="Climate Solutions News"
                style={{ width: '100%', minHeight: '92vh', border: 'none' }}
                allowFullScreen
              />
            </div>
          );v
    case 'feedback':
      return <Feedback />;
    case 'changelog':
      return (
        <div style={{ width: '100%', height: '100%' }}>
          <iframe
            src="https://members.nexusclimate.co/tag/portal/"
            title="IDAIC Changelog"
            style={{ width: '100%', minHeight: '95vh', border: 'none' }}
            allowFullScreen
          />
        </div>
      );
    case 'admin':
      if (isAdminAuthenticated) {
        return <Admin />;
      } else {
        return (
          <div className="flex items-center justify-center h-full bg-black">
            <div className="text-center bg-black p-8 rounded-lg">
              <h1 className="text-3xl font-bold mb-6 text-white">Admin Access Required</h1>
              <p className="text-lg text-gray-300 mb-8">Please enter the admin password to access this page.</p>
              <AdminPasswordPrompt 
                setIsAdminAuthenticated={setIsAdminAuthenticated}
              />
            </div>
          </div>
        );
      }
    case 'logout':
      return (
        <div>
          <h1 className="text-3xl font-bold mb-6">Sign Out</h1>
          <p className="text-lg text-gray-600">You have been successfully signed out.</p>
        </div>
      );
    case 'portal-admin':
      if (isAdminAuthenticated) {
        return <Admin />;
      } else {
        return (
          <div className="flex items-center justify-center h-full bg-black">
            <div className="text-center bg-black p-8 rounded-lg">
              <h1 className="text-3xl font-bold mb-6 text-white">Admin Access Required</h1>
              <p className="text-lg text-gray-300 mb-8">Please enter the admin password to access this page.</p>
              <AdminPasswordPrompt 
                setIsAdminAuthenticated={setIsAdminAuthenticated}
              />
            </div>
          </div>
        );
      }
    case 'settings':
      return <Settings />;
    case 'projects':
      return <Projects />;
    default:
      return (
        <div>
          <h1 className="text-3xl font-bold mb-6">Welcome</h1>
          <p className="text-lg text-gray-600">Select an item from the sidebar to get started.</p>
        </div>
      );
  }
} 