import { atom, useAtom } from 'jotai';

const selectedCategoryAtom = atom(null);

const useSelectedCategory = () => {
    const [selectedCategory, setSelectedCategory] = useAtom(selectedCategoryAtom);
    return [selectedCategory, setSelectedCategory];
};

export default useSelectedCategory;
