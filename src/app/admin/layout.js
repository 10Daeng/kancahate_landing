import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'Kancah Ate | Admin Panel',
  description: 'Panel Manajemen Kancah Ate',
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto lg:pl-72 w-full">
        {/* We add extra padding at the top for mobile because the mobile toggle button is absolute */}
        <div className="pt-16 lg:pt-0 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
