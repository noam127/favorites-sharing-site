import { useState } from 'react';
import useAsync from '../hooks/useAsync';

function ShareLinkDisplay({ token, onRegenerateToken }) {
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}/public/${token}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            alert('Failed to copy to clipboard');
        }
    };

    const handleRegenerate = useAsync(async () => {
        if (!window.confirm('Regenerate share link? The old link will stop working.')) {
            return;
        }

        try {
            await onRegenerateToken();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to regenerate token');
        }
    });

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
                <h6 className="card-title mb-2">
                    <i className="bi bi-share me-2"></i>
                    Share Your Favorites
                </h6>
                <p className="text-muted small mb-2">Share all your public favorites with this link</p>
                <div className="input-group input-group-sm mb-2">
                    <input
                        type="text"
                        className="form-control"
                        value={shareUrl}
                        readOnly
                    />
                    <button
                        className={`btn ${copied ? 'btn-success' : 'btn-outline-primary'}`}
                        onClick={handleCopy}
                    >
                        <i className={`bi bi-${copied ? 'check' : 'clipboard'} me-1`}></i>
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleRegenerate.run}
                    disabled={handleRegenerate.loading}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    {handleRegenerate.loading ? 'Regenerating...' : 'Regenerate Link'}
                </button>
            </div>
        </div>
    );
}

export default ShareLinkDisplay;
