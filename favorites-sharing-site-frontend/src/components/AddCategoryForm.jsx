import { useState } from 'react';

function AddCategoryForm({ onAdd, onCancel }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Category name is required');
            return;
        }

        if (name.trim().length > 50) {
            setError('Category name must be 50 characters or less');
            return;
        }

        setLoading(true);

        try {
            await onAdd(name.trim());
            setName('');
            onCancel();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
                <h6 className="card-title mb-3">New Category</h6>
                <form onSubmit={handleSubmit}>
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
