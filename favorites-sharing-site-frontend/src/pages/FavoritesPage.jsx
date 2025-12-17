import { useState, useEffect } from 'react';
import axios from '../api/axios';
import CategoryList from '../components/CategoryList';
import FavoritesList from '../components/FavoritesList';
import ShareLinkDisplay from '../components/ShareLinkDisplay';
import SuggestionsModal from '../components/SuggestionsModal';
import useAsync from '../hooks/useAsync';
import useSuggestions from '../hooks/useSuggestions';
import useSelectedCategory from '../hooks/useSelectedCategory';
import useCategories from '../hooks/useCategories';
import useFavorites from '../hooks/useFavorites';

function FavoritesPage({ user, onSignOut }) {
    const categories = useCategories();
    const [selectedCategory] = useSelectedCategory();
    const favorites = useFavorites();
    const [publicShareToken, setPublicShareToken] = useState(user.publicShareToken);
    const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
    const suggestions = useSuggestions();

    const fetchCategories = useAsync(async () => {
        try {
            const response = await axios.get('/api/categories');
            categories.setAll(response.data.categories);
        } catch (err) {
            throw err.response?.data?.error || 'Failed to load categories';
        }
    });

    const fetchFavorites = useAsync(async (categoryName) => {
        try {
            const response = await axios.get(`/api/categories/${encodeURIComponent(categoryName)}/favorites`);
            favorites.setAll(response.data.favorites);
        } catch (err) {
            throw err.response?.data?.error || 'Failed to load favorites';
        }
    });

    const loading = fetchCategories.isRunning || fetchFavorites.isRunning;
    const error = fetchCategories.error || fetchFavorites.error;

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories.run();
    }, []);

    // Fetch favorites when category is selected
    useEffect(() => {
        if (selectedCategory) {
            fetchFavorites.run(selectedCategory.name);
        } else {
            favorites.setAll([]);
        }
    }, [selectedCategory]);

    const handleRegenerateToken = async () => {
        const response = await axios.patch('/api/auth/regenerate-token');
        const newToken = response.data.publicShareToken;
        setPublicShareToken(newToken);
    };

    const handleGetSuggestions = () => {
        setShowSuggestionsModal(true);
        suggestions.fetch();
    };

    const navbar = (
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
                        onClick={onSignOut}
                        className="btn btn-outline-light btn-sm"
                    >
                        Sign Out
                    </button>
                </div>
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

    return (
        <div className="min-vh-100 min-vw-100" style={{ backgroundColor: '#f8f9fa' }}>
            {navbar}

            <main className="container py-4">
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError('')}
                        ></button>
                    </div>
                )}

                <div className="mb-4">
                    <ShareLinkDisplay
                        token={publicShareToken}
                        onRegenerateToken={handleRegenerateToken}
                    />
                </div>

                <div className="row">
                    <div className="col-md-4 mb-4">
                        <CategoryList onGetSuggestions={handleGetSuggestions} />
                    </div>

                    <div className="col-md-8">
                        <FavoritesList />
                    </div>
                </div>
            </main>

            <SuggestionsModal
                show={showSuggestionsModal}
                onClose={() => setShowSuggestionsModal(false)}
            />
        </div>
    );
}

export default FavoritesPage;
