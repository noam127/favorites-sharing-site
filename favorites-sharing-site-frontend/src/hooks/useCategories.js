import { atom, useAtom } from 'jotai';
import axios from '../api/axios';
import useSelectedCategory from './useSelectedCategory';

const categoriesAtom = atom([]);

const useCategories = () => {
    const [categories, setCategories] = useAtom(categoriesAtom);
    const [selectedCategory, setSelectedCategory] = useSelectedCategory();

    return {
        getAll: () => categories,
        setAll: (newCategories) => setCategories(newCategories),
        add: async (name) => {
            try {
                const response = await axios.post('/api/categories', { name });
                const newCategory = response.data.category;
                setCategories([newCategory, ...categories]);
                setSelectedCategory(newCategory);
            } catch (err) {
                alert(err.response?.data?.error || 'Failed to add category');
            }
        },
        delete: async (categoryName) => {
            try {
                await axios.delete(`/api/categories/${encodeURIComponent(categoryName)}`);
                setCategories(categories.filter(cat => cat.name !== categoryName));

                if (selectedCategory?.name === categoryName) {
                    setSelectedCategory(null);
                }
            } catch (err) {
                alert(err.response?.data?.error || 'Failed to delete category');
            }
        },
    };
};

export default useCategories;
