import { useState } from 'react';
import axios from '../api/axios';
import useAsync from '../hooks/useAsync';

function SignInPage({ onSignIn }) {
    const [username, setUsername] = useState('');

    const handleSubmit = useAsync(async (e) => {
        e.preventDefault();

        if (!username.trim()) {
            throw 'Please enter a username';
        }

        try {
            const response = await axios.post('/api/auth/signin', { username: username.trim() });
            onSignIn(response.data.user, response.data.isNewUser);
        } catch (err) {
            if (err.response) {
                throw err.response.data.error || 'Sign in failed';
            } else {
                throw 'Could not connect to server. Please make sure the backend is running.';
            }
        }
    });

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

                                <form onSubmit={handleSubmit.run}>
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Username"
                                            disabled={handleSubmit.isRunning}
                                            autoFocus
                                        />
                                    </div>

                                    {handleSubmit.error && (
                                        <div className="alert alert-danger" role="alert">
                                            {handleSubmit.error}
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
                                            disabled={handleSubmit.isRunning}
                                        >
                                            {handleSubmit.isRunning ? (
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
