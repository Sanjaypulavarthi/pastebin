import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Loader2, FileText } from 'lucide-react';

export default function PastebinApp() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    // Reset states
    setError('');
    setPasteUrl('');
    setCopied(false);

    // Validate content
    if (!content.trim()) {
      setError('Please enter some content to create a paste');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        content: content.trim()
      };

      // Add optional fields only if provided
      if (ttlSeconds && parseInt(ttlSeconds) > 0) {
        payload.ttl_seconds = parseInt(ttlSeconds);
      }
      if (maxViews && parseInt(maxViews) > 0) {
        payload.max_views = parseInt(maxViews);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/pastes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      // Construct the full URL
      const fullUrl = `http://localhost:5000/p/${data.id}`;
      setPasteUrl(fullUrl);
      
      // Clear the input fields
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError(err.message || 'An error occurred while creating the paste');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pasteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleReset = () => {
    setPasteUrl('');
    setError('');
    setCopied(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pastebin Lite
          </h1>
          <p className="text-gray-600">
            Share text snippets quickly and securely
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!pasteUrl ? (
            <div className="space-y-6">
              {/* Content Textarea */}
              <div>
                <label 
                  htmlFor="content" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Paste Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter your text here... (Ctrl/Cmd + Enter to submit)"
                  rows="12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400 transition duration-200"
                  disabled={loading}
                />
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label 
                    htmlFor="ttl" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Time to Live (seconds)
                  </label>
                  <input
                    id="ttl"
                    type="number"
                    value={ttlSeconds}
                    onChange={(e) => setTtlSeconds(e.target.value)}
                    placeholder="e.g., 3600"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition duration-200"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Auto-delete after specified time
                  </p>
                </div>

                <div>
                  <label 
                    htmlFor="maxViews" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Max Views
                  </label>
                  <input
                    id="maxViews"
                    type="number"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    placeholder="e.g., 10"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition duration-200"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Auto-delete after view limit
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Paste...
                  </>
                ) : (
                  'Create Paste'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Paste Created Successfully!
                </h2>
                <p className="text-gray-600">
                  Your paste is ready to share
                </p>
              </div>

              {/* URL Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pasteUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm"
                  />
                  <button
                    onClick={handleCopyToClipboard}
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Create Another Button */}
              <button
                onClick={handleReset}
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
              >
                Create Another Paste
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Simple, fast, and secure text sharing</p>
        </div>
      </div>
    </div>
  );
}