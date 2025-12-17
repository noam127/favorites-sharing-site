import { atom, useAtom } from 'jotai';
import axios from '../api/axios';
import useSelectedCategory from './useSelectedCategory';
import useFavorites from './useFavorites';

const suggestionsAtom = atom([]);
const suggestionsLoadingAtom = atom(false);
const suggestionsErrorAtom = atom(null);

const useSuggestions = () => {
    const [selectedCategory,] = useSelectedCategory();
    const favorites = useFavorites();
    const [suggestions, setSuggestions] = useAtom(suggestionsAtom);
    const [loading, setLoading] = useAtom(suggestionsLoadingAtom);
    const [error, setError] = useAtom(suggestionsErrorAtom);

    return {
        getAll: () => suggestions,
        setAll: (newSuggestions) => setSuggestions(newSuggestions),
        fetch: async () => {
            if (!selectedCategory) return;

            setError(null);
            setLoading(true);
            setSuggestions([]);

            try {
                const response = await axios.post(`/api/categories/${encodeURIComponent(selectedCategory.name)}/suggestions`);
                setSuggestions(response.data.suggestions);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to generate suggestions');
            }

            setLoading(false);
        },
        loading,
        fetchError: error,
        addToFavorites: async (title) => {
            try {
                await favorites.add(title, false);
                // Remove from suggestions list to prevent duplicates
                setSuggestions(prev => prev.filter(s => s.title !== title));
                return true;
            } catch (err) {
                console.error('Failed to add suggestion:', err);
                return false;
            }
        }
    };
};

export default useSuggestions;
