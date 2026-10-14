import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    return (
        <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-[#0a0a0a] dark:text-neutral-100 transition-colors duration-200 ease-in-out">
            {!isAuthPage && <Navbar />}
            
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>

            {!isAuthPage && <Footer />}
        </div>
    );
}

export default App;