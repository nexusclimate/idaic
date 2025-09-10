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
  const handleIframeLoad = (title) => {
    console.log(`Iframe loaded successfully: ${title}`);
  };

  const handleIframeError = (title, error) => {
    console.error(`Iframe failed to load: ${title}`, error);
  };

  switch (currentPage) {
    case 'home':
      return <Home />;
    case 'content':
      return (
        <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, background: 'none', border: 'none' }}>
          <iframe
            src="https://members.nexusclimate.co/"
            title="IDAIC Content"
            style={{ width: '100%', height: '100%', border: 'none', margin: 0, padding: 0, background: 'none' }}
            allowFullScreen
            onLoad={() => handleIframeLoad("IDAIC Content")}
            onError={(e) => handleIframeError("IDAIC Content", e)}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          />
        </div>
      );
    case 'case-studies':
      return (
        <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, background: 'none', border: 'none' }}>
          <iframe
            src="https://members.nexusclimate.co/tag/case-study/"
            title="IDAIC Case Studies"
            style={{ width: '100%', height: '100%', border: 'none', margin: 0, padding: 0, background: 'none' }}
            allowFullScreen
            onLoad={() => handleIframeLoad("IDAIC Case Studies")}
            onError={(e) => handleIframeError("IDAIC Case Studies", e)}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          />
        </div>
      );
    case 'events':
      return <Events isAdminAuthenticated={isAdminAuthenticated} />;
    case 'members':
      return <Members />;
    case 'uk':
      return <UKChapter />;
    case 'mena':
      return <MENAChapter />;
    case 'climate-solutions':
      return (
        <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, background: 'none', border: 'none' }}>
          <iframe
            src="https://climatesolutions.news/"
            title="Climate Solutions News"
            style={{ width: '100%', height: '100%', border: 'none', margin: 0, padding: 0, background: 'none' }}
            allowFullScreen
            onLoad={() => handleIframeLoad("Climate Solutions News")}
            onError={(e) => handleIframeError("Climate Solutions News", e)}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
          />
        </div>
      );
    case 'uae-climate':
        return (
            <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, background: 'none', border: 'none' }}>
              <iframe
                src="https://news.nexusclimate.vc/ae/"
                title="Climate Solutions News"
                style={{ width: '100%', height: '100%', border: 'none', margin: 0, padding: 0, background: 'none' }}
                allowFullScreen
                onLoad={() => handleIframeLoad("Climate Solutions News")}
                onError={(e) => handleIframeError("Climate Solutions News", e)}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
              />
            </div>
          );
    case 'feedback':
      return <Feedback />;
    case 'changelog':
      return (
        <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, background: 'none', border: 'none' }}>
          <iframe
            src="https://members.nexusclimate.co/tag/portal/"
            title="IDAIC Changelog"
            style={{ width: '100%', height: '100%', border: 'none', margin: 0, padding: 0, background: 'none' }}
            allowFullScreen
            onLoad={() => handleIframeLoad("IDAIC Changelog")}
            onError={(e) => handleIframeError("IDAIC Changelog", e)}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
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
          <div className="flex items-center justify-center h-full bg-black" style={{ margin: 0, padding: 0 }}>
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