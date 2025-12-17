import { useState } from "react";

/** A hook for handling asyncronous operations */
const useLoader = (initialData, loadData) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const reload = async (...args) => {
        setError(null);
        setLoading(true);

        try {
            const newData = await loadData(...args);
            setData(newData);
        } catch (e) {
            setError(e);
        }

        setLoading(false);
    };

    return { data, setData, loading, error, reload };
};

export default useLoader;
