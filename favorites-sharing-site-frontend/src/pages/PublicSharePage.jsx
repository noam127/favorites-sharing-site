import { useEffect, useState } from 'react';
import axios from '../api/axios';
import useAsync from '../hooks/useAsync';

function PublicSharePage({ token }) {
    const [categories, setCategories] = useState([]);

    const fetchCategories = useAsync(async () => {
        try {
            const response = await axios.get(`/api/public/${token}`);
            setCategories(response.data.categories);
        } catch (err) {
            if (err.response?.status === 404) {
                throw 'This shared link is invalid or has been changed.';
            } else {
                throw 'Failed to load shared favorites.';
            }
        }
    });

    useEffect(() => {
        fetchCategories.run();
    }, [token]);

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

    if (fetchCategories.isRunning) {
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

    if (fetchCategories.error) {
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
                                    <p className="text-muted">{fetchCategories.error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const totalFavorites = categories.reduce((sum, cat) => sum + cat.favorites.length, 0);

    return (
        <div className="min-vh-100 min-vw-100" style={{ backgroundColor: '#f8f9fa' }}>
            {navbar}

            <main className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-body p-4">
                                <h2 className="card-title mb-2">
                                    <i className="bi bi-collection-fill me-2" style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}></i>
                                    Shared Favorites Collection
                                </h2>
                                <p className="text-muted mb-0">
                                    {categories.length} {categories.length === 1 ? 'category' : 'categories'} • {totalFavorites} public {totalFavorites === 1 ? 'item' : 'items'}
                                </p>
                            </div>
                        </div>

                        {totalFavorites === 0 ? (
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center p-5">
                                    <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                                    <p className="text-muted mt-3 mb-0">No public favorites to display</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {categories.map((category, categoryIndex) => (
                                    category.favorites.length > 0 && (
                                        <div key={categoryIndex} className="card border-0 shadow-sm mb-3">
                                            <div className="card-body p-4">
                                                <h5 className="card-title mb-3">
                                                    <i className="bi bi-folder2-open me-2 text-primary"></i>
                                                    {category.name}
                                                    <span className="badge bg-primary ms-2">
                                                        {category.favorites.length}
                                                    </span>
                                                </h5>
                                                <div>
                                                    {category.favorites.map((favorite, favIndex) => (
                                                        <div key={favIndex} className="d-flex align-items-center py-2 border-bottom">
                                                            <i className="bi bi-star-fill text-warning me-3"></i>
                                                            <span>{favorite.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )
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
