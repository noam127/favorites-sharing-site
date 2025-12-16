import { useState } from 'react';

function ShareLinkDisplay({ token, categoryName, onRegenerateToken }) {
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const handleRegenerate = async () => {
        if (!window.confirm('Regenerate share link? The old link will stop working.')) {
            return;
        }

        setLoading(true);
        try {
            await onRegenerateToken(categoryName);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to regenerate token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
                <h6 className="card-title mb-2">
                    <i className="bi bi-share me-2"></i>
                    Public Share Link
                </h6>
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
                    onClick={handleRegenerate}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    {loading ? 'Regenerating...' : 'Regenerate Link'}
                </button>
            </div>
        </div>
    );
}

export default ShareLinkDisplay;
