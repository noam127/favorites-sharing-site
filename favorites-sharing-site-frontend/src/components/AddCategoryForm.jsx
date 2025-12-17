import useLoader from '../hooks/useLoader';

function AddCategoryForm({ onAdd, onCancel }) {
    const { data: name, setData: setName, loading, error, reload } = useLoader('', async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            throw 'Category name is required';
        }

        if (name.trim().length > 50) {
            throw 'Category name must be 50 characters or less';
        }

        try {
            await onAdd(name.trim());
            onCancel();
            return '';
        } catch (err) {
            throw err.response?.data?.error || 'Failed to create category';
        }
    });

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
                <h6 className="card-title mb-3">New Category</h6>
                <form onSubmit={reload}>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Category name (e.g., Books, Movies)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            autoFocus
                            disabled={loading}
                        />
                        {error && <div className="text-danger small mt-1">{error}</div>}
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddCategoryForm;
