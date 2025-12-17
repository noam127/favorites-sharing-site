import { atom, useAtom } from 'jotai';

const categoriesAtom = atom(null);

const useSelectedCategory = () => {
    const [categories, setCategories] = useAtom(categoriesAtom);
    return [categories, setCategories];
};

export default useSelectedCategory;
