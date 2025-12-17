import { useState } from 'react';

function AddFavoriteForm({ onAdd }) {
    const [title, setTitle] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        if (title.trim().length > 200) {
            setError('Title must be 200 characters or less');
            return;
        }

        setLoading(true);

        try {
            await onAdd(title.trim(), isPrivate);
            setTitle('');
            setIsPrivate(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add favorite');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Add a new favorite..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            disabled={loading}
                        />
                        {error && <div className="text-danger small mt-1">{error}</div>}
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="privateCheckbox"
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                disabled={loading}
                            />
                            <label className="form-check-label text-muted small" htmlFor="privateCheckbox">
                                <i className="bi bi-lock me-1"></i>
                                Private
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddFavoriteForm;
