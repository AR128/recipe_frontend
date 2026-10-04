import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // Always scroll to top when opening a new page
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);

    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-bg)',
                color: 'var(--color-text-primary)',
                transition: 'background-color 0.2s ease, color 0.2s ease',
            }}
        >
            {!isAuthPage && <Navbar />}
            
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Outlet />
            </main>

            {!isAuthPage && <Footer />}
        </div>
    );
}

export default App;