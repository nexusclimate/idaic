import SidebarLayout from './layouts/sidebar-layout';
import HomeSidebar from './pages/home';

export default function App() {
  return (
    <SidebarLayout
      sidebar={<HomeSidebar />}
      navbar={null /* keep your Catalyst navbar here later */}
    >
      {/* whatever main content you want */}
      <h1 className="text-2xl font-bold">Welcome to IDAIC Portal</h1>
    </SidebarLayout>
  );
}