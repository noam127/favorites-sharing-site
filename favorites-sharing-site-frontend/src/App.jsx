import { useState, useEffect } from 'react';
import SignInPage from './pages/SignInPage';
import FavoritesPage from './pages/FavoritesPage';
import PublicSharePage from './pages/PublicSharePage';
import axios from './api/axios';
import useAsync from './hooks/useAsync';

function App() {
    const [user, setUser] = useState(null);

    // Check if this is a public share page
    if (window.location.pathname.startsWith('/public/')) {
        const token = window.location.pathname.split('/')[2];
        return <PublicSharePage token={token} />;
    }

    const checkSession = useAsync(async () => {
        try {
            const response = await axios.get('/api/auth/session');
            if (response.data.authenticated) {
                setUser(response.data.user);
            }
        } catch (error) {
            // 'Unauthorized' is expected behaviour
            if (error.status == 401) {
                return;
            }

            console.error('Failed to check session:', error);
        }
    });

    // Check for existing session on mount
    useEffect(() => {
        checkSession.run();
    }, []);

    const handleSignIn = (userData, isNewUser) => {
        setUser(userData);
        if (isNewUser) {
            console.log('New account created for:', userData.username);
        } else {
            console.log('Signed in as:', userData.username);
        }
    };

    const handleSignOut = async () => {
        try {
            await axios.post('/api/auth/signout');
        } catch (error) {
            console.error('Failed to sign out:', error);
        }

        setUser(null);
    };

    if (checkSession.isRunning) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (user) {
        return <FavoritesPage user={user} onSignOut={handleSignOut} />;
    } else {
        return <SignInPage onSignIn={handleSignIn} />;
    }
}

export default App;
