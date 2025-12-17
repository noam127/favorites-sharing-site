import { atom, useAtom } from 'jotai';

const suggestionsAtom = atom([]);

const useSuggestions = () => {
    return useAtom(suggestionsAtom);
};

export default useSuggestions;
