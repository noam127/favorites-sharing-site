import { useState } from 'react';
import SignIn from './SignIn';

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
        <div className="min-vh-100 min-vw-100" style={{ backgroundColor: '#f8f9fa' }}>
            <nav className="navbar navbar-expand-lg shadow-sm"
                 style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="container-fluid px-4">
                    <span className="navbar-brand text-white fw-bold fs-4 mb-0">
                        Favorites Sharing Site
                    </span>
                    <div className="d-flex align-items-center">
                        <span className="text-white me-3">
                            <i className="bi bi-person-circle me-2"></i>
                            Welcome, <strong>{user.username}</strong>!
                        </span>
                        <button
                            onClick={handleSignOut}
                            className="btn btn-outline-light btn-sm"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <h2 className="card-title mb-3">
                                    <i className="bi bi-person-check-fill text-success me-2"></i>
                                    You're signed in!
                                </h2>
                                <p className="card-text text-muted mb-3">
                                    Signed in as <span className="badge bg-primary">{user.username}</span>
                                </p>
                                <hr />
                                <div className="alert alert-info mb-0" role="alert">
                                    <i className="bi bi-info-circle-fill me-2"></i>
                                    <strong>Coming soon:</strong> Share your favorite things with friends!
                                </div>
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <h3 className="card-title h5 mb-3">Account Information</h3>
                                <ul className="list-group list-group-flush">
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <span className="text-muted">Username</span>
                                        <strong>{user.username}</strong>
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                                        <span className="text-muted">Account Created</span>
                                        <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
