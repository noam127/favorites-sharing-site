import { useState } from 'react';

function SignInPage({ onSignIn }) {
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
                credentials: 'include', // Important: include cookies for session
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
        <div className="min-vh-100 min-vw-100 d-flex align-items-center justify-content-center bg-gradient"
             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-5">
                        <div className="card shadow-lg border-0 rounded-lg">
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <h1 className="fw-bold text-dark mb-2">Welcome</h1>
                                    <p className="text-muted">
                                        Enter your username to sign in or create a new account
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Username"
                                            disabled={loading}
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}

                                    <div className="d-grid">
                                        <button
                                            type="submit"
                                            className="btn btn-lg btn-primary"
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                border: 'none'
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Signing in...
                                                </>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignInPage;
