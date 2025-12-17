import { useState } from "react";

/** A hook for handling asyncronous operations */
const useLoader = (initialData, loadData) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const reload = async () => {
        setError(null);
        setLoading(true);

        try {
            const newData = await loadData();
            setData(newData);
        } catch (e) {
            setError(e);
        }

        setLoading(false);
    };

    return { data, loading, error, reload };
};

export default useLoader;
