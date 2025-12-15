import { useState } from 'react';
import SignIn from './SignIn';
import './App.css';

function App() {
    const [user, setUser] = useState(null);

    const handleSignIn = (userData, isNewUser) => {
        setUser(userData);
        if (isNewUser) {
            console.log('New account created for:', userData.username);
        } else {
            console.log('Signed in as:', userData.username);
        }
    };

    const handleSignOut = () => {
        setUser(null);
    };

    if (!user) {
        return <SignIn onSignIn={handleSignIn} />;
    }

    return (
        <div className="app">
            <header className="app-header">
                <h1>Favorites Sharing Site</h1>
                <div className="user-info">
                    <span>Welcome, {user.username}!</span>
                    <button onClick={handleSignOut} className="signout-button">
                        Sign Out
                    </button>
                </div>
            </header>
            <main className="app-content">
                <p>You're signed in as {user.username}</p>
                <p className="info-text">Content coming soon...</p>
            </main>
        </div>
    );
}

export default App;
