import { useState } from 'react';
import useSuggestions from '../hooks/useSuggestions';

function SuggestionsModal({ show, onClose, categoryName, loading, error, onAddSuggestion }) {
    const [suggestions] = useSuggestions();
    const [addedSuggestions, setAddedSuggestions] = useState(new Set());
    const [addingTitle, setAddingTitle] = useState(null);

    if (!show) return null;

    const handleAddClick = async (suggestion) => {
        setAddingTitle(suggestion.title);
        const success = await onAddSuggestion(suggestion.title);

        if (success) {
            setAddedSuggestions(new Set([...addedSuggestions, suggestion.title]));
        }

        setAddingTitle(null);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className={`modal-backdrop fade ${show ? 'show' : ''}`}
                style={{ display: show ? 'block' : 'none' }}
            ></div>

            {/* Modal */}
            <div
                className={`modal fade ${show ? 'show' : ''}`}
                style={{ display: show ? 'block' : 'none' }}
                tabIndex="-1"
                onClick={handleBackdropClick}
            >
                <div className="modal-dialog modal-dialog-scrollable">
                    <div className="modal-content">
                        {/* Header */}
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="bi bi-lightbulb me-2"></i>
                                Suggestions for {categoryName}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                aria-label="Close"
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body">
                            {/* Loading State */}
                            {loading && (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary mb-3" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="text-muted">Generating suggestions...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && !loading && (
                                <div className="alert alert-danger" role="alert">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            {/* Suggestions List */}
                            {!loading && !error && suggestions.length > 0 && (
                                <div className="d-flex flex-column gap-3">
                                    {suggestions.map((suggestion, index) => {
                                        const isAdded = addedSuggestions.has(suggestion.title);
                                        const isAdding = addingTitle === suggestion.title;

                                        return (
                                            <div
                                                key={index}
                                                className="card border-0 shadow-sm"
                                            >
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="flex-grow-1">
                                                            <h6 className="mb-2">{suggestion.title}</h6>
                                                            <p className="text-muted mb-0 small">
                                                                {suggestion.reason}
                                                            </p>
                                                        </div>
                                                        <button
                                                            className={`btn btn-sm ms-3 ${
                                                                isAdded
                                                                    ? 'btn-success'
                                                                    : 'btn-outline-primary'
                                                            }`}
                                                            onClick={() => handleAddClick(suggestion)}
                                                            disabled={isAdded || isAdding}
                                                            style={{ minWidth: '70px' }}
                                                        >
                                                            {isAdding ? (
                                                                <span
                                                                    className="spinner-border spinner-border-sm"
                                                                    role="status"
                                                                    aria-hidden="true"
                                                                ></span>
                                                            ) : isAdded ? (
                                                                <>
                                                                    <i className="bi bi-check-lg me-1"></i>
                                                                    Added
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <i className="bi bi-plus-lg me-1"></i>
                                                                    Add
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && !error && suggestions.length === 0 && (
                                <div className="text-center py-4">
                                    <i
                                        className="bi bi-inbox text-muted"
                                        style={{ fontSize: '2rem' }}
                                    ></i>
                                    <p className="text-muted mt-2 mb-0">
                                        No suggestions available at this time
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SuggestionsModal;
