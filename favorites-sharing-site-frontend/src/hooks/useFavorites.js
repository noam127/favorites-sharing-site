import { atom, useAtom } from 'jotai';
import axios from '../api/axios';

const favoritesAtom = atom([]);

const useFavorites = () => {
    const [favorites, setFavorites] = useAtom(favoritesAtom);

    return {
        getAll: () => favorites,
        setAll: (newFavorites) => setFavorites(newFavorites),
        add: async (title, isPrivate) => {
            if (!selectedCategory) return;

            let response;
            try {
                response = await axios.post(
                    `/api/categories/${encodeURIComponent(selectedCategory.name)}/favorites`,
                    { title, isPrivate }
                );
            } catch (err) {
                alert(err.response?.data?.error || 'Failed to add favorite');
                return;
            }

            setFavorites([response.data.favorite, ...favorites]);

            // Update favorite count in categories list
            categories.setAll(categories.getAll().map(cat =>
                cat.name === selectedCategory.name
                    ? { ...cat, favoriteCount: cat.favoriteCount + 1 }
                    : cat
            ));
        },
        update: async (favoriteId, updates) => {
            try {
                await axios.patch(`/api/favorites/${favoriteId}`, updates);
            } catch (err) {
                alert(err.response?.data?.error || 'Failed to update favorite');
                return;
            }

            setFavorites(favorites.map(fav =>
                fav._id === favoriteId
                    ? { ...fav, ...updates }
                    : fav
            ));
        },
        delete: async (favoriteId) => {
            try {
                await axios.delete(`/api/favorites/${favoriteId}`);
                setFavorites(favorites.filter(fav => fav._id !== favoriteId));

                // Update favorite count in categories list
                if (selectedCategory) {
                    categories.setAll(categories.getAll().map(cat =>
                        cat.name === selectedCategory.name
                            ? { ...cat, favoriteCount: Math.max(0, cat.favoriteCount - 1) }
                            : cat
                    ));
                }
            } catch (err) {
                alert(err.response?.data?.error || 'Failed to delete favorite');
            }
        }
    };
};

export default useFavorites;
