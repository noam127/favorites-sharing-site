import { useState, useEffect } from 'react';
import SignInPage from './pages/SignInPage';
import FavoritesPage from './pages/FavoritesPage';
import axios from './api/axios';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
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
            } finally {
                setLoading(false);
            }
        };

        checkSession();
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

    if (loading) {
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
