import { atom, useAtom } from 'jotai';

const favoritesAtom = atom(null);

const useSelectedCategory = () => {
    const [favorites, setFavorites] = useAtom(favoritesAtom);
    return [favorites, setFavorites];
};

export default useSelectedCategory;
