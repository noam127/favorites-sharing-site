import { useState } from 'react';
import CategoryCard from './CategoryCard';
import AddCategoryForm from './AddCategoryForm';
import useSelectedCategory from '../hooks/useSelectedCategory';
import useCategories from '../hooks/useCategories';
import useSuggestions from '../hooks/useSuggestions';

function CategoryList({ onGetSuggestions }) {
    const categories = useCategories();
    const [selectedCategory, setSelectedCategory] = useSelectedCategory();
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">My Categories</h5>
                <div className="d-flex gap-2">
                    {selectedCategory && (
                        <button
                            className="btn btn-success btn-sm"
                            onClick={onGetSuggestions}
                        >
                            <i className="bi bi-lightbulb me-1"></i>
                            Suggestions
                        </button>
                    )}
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowAddForm(true)}
                        disabled={showAddForm}
                    >
                        <i className="bi bi-plus-circle me-1"></i>
                        New
                    </button>
                </div>
            </div>

            {showAddForm && (
                <AddCategoryForm
                    onAdd={categories.add}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {categories.getAll().length === 0 && !showAddForm && (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                        <i className="bi bi-folder-plus text-muted" style={{ fontSize: '2rem' }}></i>
                        <p className="text-muted mt-2 mb-0">No categories yet</p>
                        <small className="text-muted">Create your first category to get started</small>
                    </div>
                </div>
            )}

            {categories.getAll().map((category) => (
                <CategoryCard
                    key={category._id}
                    category={category}
                    isSelected={selectedCategory?.name === category.name}
                    onSelect={() => setSelectedCategory(category)}
                    onDelete={categories.delete}
                />
            ))}
        </div>
    );
}

export default CategoryList;
