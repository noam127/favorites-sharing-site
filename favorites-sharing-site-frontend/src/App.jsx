import { useState, useEffect } from 'react';
import SignInPage from './pages/SignInPage';
import FavoritesPage from './pages/FavoritesPage';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/auth/session', {
                    credentials: 'include' // Important: include cookies
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.authenticated) {
                        setUser(data.user);
                    }
                }
            } catch (error) {
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
            await fetch('http://localhost:3000/api/auth/signout', {
                method: 'POST',
                credentials: 'include'
            });
            setUser(null);
        } catch (error) {
            console.error('Failed to sign out:', error);
            // Still sign out locally even if backend fails
            setUser(null);
        }
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
