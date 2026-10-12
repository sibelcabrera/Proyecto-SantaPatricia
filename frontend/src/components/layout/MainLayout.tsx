import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background font-sans flex">
      <Sidebar />
      <div className="flex-1 ml-72 min-w-0 flex flex-col">
        <Header />
        <main className="p-8 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
