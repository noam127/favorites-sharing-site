import AddFavoriteForm from './AddFavoriteForm';
import FavoriteItem from './FavoriteItem';
import ShareLinkDisplay from './ShareLinkDisplay';

function FavoritesList({ category, favorites, onAddFavorite, onUpdateFavorite, onDeleteFavorite, onRegenerateToken }) {
    if (!category) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body text-center p-5">
                    <i className="bi bi-arrow-left text-muted" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted mt-3 mb-0">Select a category to view favorites</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h5 className="mb-3">{category.name}</h5>

            <ShareLinkDisplay
                token={category.publicShareToken}
                categoryName={category.name}
                onRegenerateToken={onRegenerateToken}
            />

            <AddFavoriteForm onAdd={onAddFavorite} />

            {favorites.length === 0 && (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                        <i className="bi bi-star text-muted" style={{ fontSize: '2rem' }}></i>
                        <p className="text-muted mt-2 mb-0">No favorites yet</p>
                        <small className="text-muted">Add your first favorite item above</small>
                    </div>
                </div>
            )}

            <div>
                {favorites.map((favorite) => (
                    <FavoriteItem
                        key={favorite._id}
                        favorite={favorite}
                        onUpdate={onUpdateFavorite}
                        onDelete={onDeleteFavorite}
                    />
                ))}
            </div>
        </div>
    );
}

export default FavoritesList;
