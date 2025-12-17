function CategoryCard({ category, isSelected, onSelect, onDelete }) {
    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`Delete "${category.name}" and all its favorites?`)) {
            onDelete(category.name);
        }
    };

    const cardStyle = isSelected
        ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', cursor: 'pointer' }
        : { cursor: 'pointer' };

    return (
        <div
            className={`card border-0 shadow-sm mb-2 ${isSelected ? '' : 'card-hover'}`}
            style={cardStyle}
            onClick={onSelect}
        >
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                        <h6 className={`mb-1 ${isSelected ? 'text-white' : ''}`}>
                            {category.name}
                        </h6>
                        <small className={isSelected ? 'text-white-50' : 'text-muted'}>
                            {category.favoriteCount} {category.favoriteCount === 1 ? 'item' : 'items'}
                        </small>
                    </div>
                    <button
                        className={`btn btn-sm ${isSelected ? 'btn-outline-light' : 'btn-outline-danger'}`}
                        onClick={handleDelete}
                        title="Delete category"
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CategoryCard;
