import { useState } from 'react';
import useAsync from '../hooks/useAsync';
import useFavorites from '../hooks/useFavorites';

function FavoriteItem({ favorite }) {
    const favorites = useFavorites();
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(favorite.title);
    
    const handleSave = useAsync(async () => {
        if (!editTitle.trim()) {
            return;
        }
        
        if (editTitle.trim() === favorite.title) {
            setIsEditing(false);
            return;
        }

        await favorites.update(favorite._id, { title: editTitle.trim() });
        setIsEditing(false);
    });
    
    const handleTogglePrivacy = useAsync(async () => {
        await favorites.update(favorite._id, { isPrivate: !favorite.isPrivate });
    });

    const loading = handleSave.isRunning || handleTogglePrivacy.isRunning;

    const handleDelete = () => {
        if (window.confirm(`Delete "${favorite.title}"?`)) {
            favorites.delete(favorite._id);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave.run();
        } else if (e.key === 'Escape') {
            setEditTitle(favorite.title);
            setIsEditing(false);
        }
    };

    return (
        <div
            className={`card border-0 shadow-sm mb-2 ${favorite.isPrivate ? 'bg-light' : ''}`}
        >
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1 me-2">
                        {isEditing ? (
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={handleSave.run}
                                onKeyDown={handleKeyDown}
                                maxLength={200}
                                autoFocus
                                disabled={loading}
                            />
                        ) : (
                            <div className="d-flex align-items-center">
                                {favorite.isPrivate && (
                                    <i className="bi bi-lock-fill text-muted me-2"></i>
                                )}
                                <span
                                    onClick={() => !loading && setIsEditing(true)}
                                    style={{ cursor: 'pointer' }}
                                    className={favorite.isPrivate ? 'text-muted' : ''}
                                >
                                    {favorite.title}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="d-flex gap-1">
                        <button
                            className={`btn btn-sm ${favorite.isPrivate ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                            onClick={handleTogglePrivacy.run}
                            disabled={loading}
                            title={favorite.isPrivate ? 'Make public' : 'Make private'}
                        >
                            <i className={`bi bi-${favorite.isPrivate ? 'unlock' : 'lock'}`}></i>
                        </button>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={handleDelete}
                            disabled={loading}
                            title="Delete"
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FavoriteItem;
