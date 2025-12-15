import { useState } from 'react';
import SignInPage from './pages/SignInPage';
import FavoritesPage from './pages/FavoritesPage';

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

    if (user) {
        return <FavoritesPage user={user} onSignOut={handleSignOut} />;
    } else {
        return <SignInPage onSignIn={handleSignIn} />;
    }
}

export default App;
