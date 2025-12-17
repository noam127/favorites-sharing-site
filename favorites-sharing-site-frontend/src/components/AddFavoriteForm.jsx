import useLoader from '../hooks/useLoader';

function AddFavoriteForm({ onAdd }) {
    const {
        data: favorite,
        setData: setFavorite,
        loading,
        error,
        reload: handleSubmit,
    } = useLoader({ title: '', isPrivate: false }, async (event) => {
        event.preventDefault();

        if (!favorite.title.trim()) {
            throw 'Title is required';
        }

        if (favorite.title.trim().length > 200) {
            throw 'Title must be 200 characters or less';
        }

        try {
            await onAdd(favorite.title.trim(), favorite.isPrivate);
            return { title: '', isPrivate: false };
        } catch (err) {
            throw err.response?.data?.error || 'Failed to add favorite';
        }
    });

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Add a new favorite..."
                            value={favorite.title}
                            onChange={(e) => setFavorite({ ...favorite, title: e.target.value })}
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
                                checked={favorite.isPrivate}
                                onChange={(e) => setFavorite({ ...favorite, isPrivate: e.target.checked })}
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
