import { useState } from 'react';
import useAsync from '../hooks/useAsync';

function AddCategoryForm({ onAdd, onCancel }) {
    const [name, setName] = useState('');
    const handleSubmit = useAsync(async (event) => {
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
            setName('');
        } catch (err) {
            throw err.response?.data?.error || 'Failed to create category';
        }
    });

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
                <h6 className="card-title mb-3">New Category</h6>
                <form onSubmit={handleSubmit.run}>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Category name (e.g., Books, Movies)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                            autoFocus
                            disabled={handleSubmit.isRunning}
                        />
                        {handleSubmit.error && <div className="text-danger small mt-1">{handleSubmit.error}</div>}
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={handleSubmit.isRunning}
                        >
                            {handleSubmit.isRunning ? 'Creating...' : 'Create'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={onCancel}
                            disabled={handleSubmit.isRunning}
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
