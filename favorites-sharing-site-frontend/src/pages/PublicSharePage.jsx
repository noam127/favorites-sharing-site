import { useState, useEffect } from 'react';
import axios from '../api/axios';

function PublicSharePage({ token }) {
    const [category, setCategory] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPublicData();
    }, [token]);

    const fetchPublicData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/public/${token}`);
            setCategory(response.data.category);
            setFavorites(response.data.favorites);
            setError('');
        } catch (err) {
            if (err.response?.status === 404) {
                setError('This shared link is invalid or has been changed.');
            } else {
                setError('Failed to load shared favorites.');
            }
        } finally {
            setLoading(false);
        }
    };

    const navbar = (
        <nav className="navbar navbar-expand-lg shadow-sm"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="container-fluid px-4">
                <span className="navbar-brand text-white fw-bold fs-4 mb-0">
                    Favorites Sharing Site
                </span>
                <span className="text-white">
                    <i className="bi bi-share me-2"></i>
                    Shared Favorites
                </span>
            </div>
        </nav>
    );

    if (loading) {
        return (
            <div className="min-vh-100 min-vw-100" style={{ backgroundColor: '#f8f9fa' }}>
                {navbar}
                <main className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-vh-100 min-vw-100" style={{ backgroundColor: '#f8f9fa' }}>
                {navbar}
                <main className="container py-5">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center p-5">
                                    <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '3rem' }}></i>
                                    <h4 className="mt-3">Link Not Found</h4>
                                    <p className="text-muted">{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-vh-100 min-vw-100" style={{ backgroundColor: '#f8f9fa' }}>
            {navbar}

            <main className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <h2 className="card-title mb-3">
                                    <i className="bi bi-folder2-open me-2" style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}></i>
                                    {category.name}
                                </h2>
                                <p className="text-muted mb-0">
                                    {favorites.length} public {favorites.length === 1 ? 'item' : 'items'}
                                </p>
                            </div>
                        </div>

                        {favorites.length === 0 ? (
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center p-5">
                                    <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-3 mb-0">This category has no public items</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {favorites.map((favorite, index) => (
                                    <div key={index} className="card border-0 shadow-sm mb-2">
                                        <div className="card-body p-3">
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-star-fill text-warning me-3"></i>
                                                <span>{favorite.title}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default PublicSharePage;
