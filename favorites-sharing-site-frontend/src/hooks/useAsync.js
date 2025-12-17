import { useState } from "react";

/** A hook for handling asyncronous operations */
const useAsync = (asyncAction) => {
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState(null);

    const run = async (...args) => {
        setError(null);
        setIsRunning(true);

        try {
            await asyncAction(...args);
        } catch (e) {
            setError(e);
        }

        setIsRunning(false);
    };

    return { run, isRunning, error };
};

export default useAsync;
