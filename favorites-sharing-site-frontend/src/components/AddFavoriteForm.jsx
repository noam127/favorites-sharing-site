import { useState } from 'react';
import useAsync from '../hooks/useAsync';
import useFavorites from '../hooks/useFavorites';

function AddFavoriteForm() {
    const [title, setTitle] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const favorites = useFavorites();

    const handleSubmit = useAsync(async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            throw 'Title is required';
        }

        if (title.trim().length > 200) {
            throw 'Title must be 200 characters or less';
        }

        try {
            await favorites.add(title.trim(), isPrivate);
            setTitle('');
            setIsPrivate(false);
        } catch (err) {
            throw err.response?.data?.error || 'Failed to add favorite';
        }
    });

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
                <form onSubmit={handleSubmit.run}>
                    <div className="mb-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Add a new favorite..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            disabled={handleSubmit.isRunning}
                        />
                        {handleSubmit.error && <div className="text-danger small mt-1">{handleSubmit.error}</div>}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="privateCheckbox"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                disabled={handleSubmit.isRunning}
                            />
                            <label className="form-check-label text-muted small" htmlFor="privateCheckbox">
                                <i className="bi bi-lock me-1"></i>
                                Private
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={handleSubmit.isRunning}
                        >
                            {handleSubmit.isRunning ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddFavoriteForm;
