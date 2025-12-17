import { useState, useEffect } from 'react';
import axios from '../api/axios';
import CategoryList from '../components/CategoryList';
import FavoritesList from '../components/FavoritesList';
import ShareLinkDisplay from '../components/ShareLinkDisplay';
import SuggestionsModal from '../components/SuggestionsModal';

function FavoritesPage({ user, onSignOut }) {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [publicShareToken, setPublicShareToken] = useState(user.publicShareToken);
    const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [suggestionsError, setSuggestionsError] = useState('');

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch favorites when category is selected
    useEffect(() => {
        if (selectedCategory) {
            fetchFavorites(selectedCategory.name);
        } else {
            setFavorites([]);
        }
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/categories');
            setCategories(response.data.categories);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async (categoryName) => {
        try {
            const response = await axios.get(`/api/categories/${encodeURIComponent(categoryName)}/favorites`);
            setFavorites(response.data.favorites);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load favorites');
        }
    };

    const handleAddCategory = async (name) => {
        const response = await axios.post('/api/categories', { name });
        const newCategory = response.data.category;
        setCategories([newCategory, ...categories]);
        setSelectedCategory(newCategory);
    };

    const handleDeleteCategory = async (categoryName) => {
        try {
            await axios.delete(`/api/categories/${encodeURIComponent(categoryName)}`);
            setCategories(categories.filter(cat => cat.name !== categoryName));

            if (selectedCategory?.name === categoryName) {
                setSelectedCategory(null);
                setFavorites([]);
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete category');
        }
    };

    const handleAddFavorite = async (title, isPrivate) => {
        if (!selectedCategory) return;

        const response = await axios.post(
            `/api/categories/${encodeURIComponent(selectedCategory.name)}/favorites`,
            { title, isPrivate }
        );

        setFavorites([response.data.favorite, ...favorites]);

        // Update favorite count in categories list
        setCategories(categories.map(cat =>
            cat.name === selectedCategory.name
                ? { ...cat, favoriteCount: cat.favoriteCount + 1 }
                : cat
        ));
    };

    const handleUpdateFavorite = async (favoriteId, updates) => {
        await axios.patch(`/api/favorites/${favoriteId}`, updates);

        setFavorites(favorites.map(fav =>
            fav._id === favoriteId
                ? { ...fav, ...updates }
                : fav
        ));
    };

    const handleDeleteFavorite = async (favoriteId) => {
        try {
            await axios.delete(`/api/favorites/${favoriteId}`);
            setFavorites(favorites.filter(fav => fav._id !== favoriteId));

            // Update favorite count in categories list
            if (selectedCategory) {
                setCategories(categories.map(cat =>
                    cat.name === selectedCategory.name
                        ? { ...cat, favoriteCount: Math.max(0, cat.favoriteCount - 1) }
                        : cat
                ));
            }
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete favorite');
        }
    };

    const handleRegenerateToken = async () => {
        const response = await axios.patch('/api/auth/regenerate-token');
        const newToken = response.data.publicShareToken;
        setPublicShareToken(newToken);
    };

    const handleGetSuggestions = async () => {
        if (!selectedCategory) return;

        setShowSuggestionsModal(true);
        setSuggestionsLoading(true);
        setSuggestionsError('');
        setSuggestions([]);

        try {
            const response = await axios.post(
                `/api/categories/${encodeURIComponent(selectedCategory.name)}/suggestions`
            );
            setSuggestions(response.data.suggestions);
        } catch (err) {
            setSuggestionsError(
                err.response?.data?.error || 'Failed to generate suggestions'
            );
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const handleAddSuggestion = async (title) => {
        try {
            await handleAddFavorite(title, false);
            // Remove from suggestions list to prevent duplicates
            setSuggestions(prev => prev.filter(s => s.title !== title));
            return true;
        } catch (err) {
            console.error('Failed to add suggestion:', err);
            return false;
        }
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
                        <CategoryList
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            onAddCategory={handleAddCategory}
                            onDeleteCategory={handleDeleteCategory}
                            onGetSuggestions={handleGetSuggestions}
                        />
                    </div>

                    <div className="col-md-8">
                        <FavoritesList
                            category={selectedCategory}
                            favorites={favorites}
                            onAddFavorite={handleAddFavorite}
                            onUpdateFavorite={handleUpdateFavorite}
                            onDeleteFavorite={handleDeleteFavorite}
                        />
                    </div>
                </div>
            </main>

            <SuggestionsModal
                show={showSuggestionsModal}
                onClose={() => setShowSuggestionsModal(false)}
                suggestions={suggestions}
                categoryName={selectedCategory?.name}
                loading={suggestionsLoading}
                error={suggestionsError}
                onAddSuggestion={handleAddSuggestion}
            />
        </div>
    );
}

export default FavoritesPage;
