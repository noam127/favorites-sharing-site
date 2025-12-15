import { useState } from 'react';
import './SignIn.css';

function SignIn({ onSignIn }) {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username.trim()) {
            setError('Please enter a username');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                onSignIn(data.user, data.isNewUser);
            } else {
                setError(data.error || 'Sign in failed');
            }
        } catch (err) {
            setError('Could not connect to server. Please make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">
                <h1>Welcome</h1>
                <p className="signin-description">
                    Enter your username to sign in or create a new account
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignIn;
