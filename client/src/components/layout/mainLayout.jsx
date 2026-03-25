import { Outlet } from 'react-router-dom';
import Navbar from './navBar';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col w-full relative">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;