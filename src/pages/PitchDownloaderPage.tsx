import React, { useState } from 'react';
import { Download, FileText, AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function PitchDownloaderPage() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [slideCount, setSlideCount] = useState<number | null>(null);

  const isValidUrl = url.trim().includes('pitch.com');

  const handleDownload = async () => {
    if (!isValidUrl) return;

    setStatus('loading');
    setError('');
    setSlideCount(null);

    try {
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      const count = response.headers.get('X-Slide-Count');
      if (count) setSlideCount(parseInt(count, 10));

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'presentation.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setStatus('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidUrl && status !== 'loading') {
      handleDownload();
    }
  };

  const reset = () => {
    setStatus('idle');
    setError('');
    setSlideCount(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pitch PDF Downloader</h1>
          <p className="text-gray-500 text-sm">
            Download any Pitch.com presentation as a PDF file
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {/* URL input */}
            <div>
              <label htmlFor="pitch-url" className="block text-sm font-medium text-gray-700 mb-1.5">
                Presentation URL
              </label>
              <input
                id="pitch-url"
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); if (status !== 'idle') reset(); }}
                onKeyDown={handleKeyDown}
                placeholder="https://pitch.com/v/your-presentation..."
                disabled={status === 'loading'}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 transition"
              />
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-600">How it works:</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Open your presentation on Pitch.com</li>
                <li>Copy the URL from the browser address bar</li>
                <li>Paste it above and click Download PDF</li>
                <li>Stay on this page while the download processes</li>
              </ol>
            </div>

            {/* Status messages */}
            {status === 'loading' && (
              <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 rounded-lg px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500 flex-shrink-0" />
                <span>Capturing slides and generating PDF — this may take a minute...</span>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  PDF downloaded successfully
                  {slideCount !== null && ` (${slideCount} slide${slideCount !== 1 ? 's' : ''})`}!
                </span>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 rounded-lg px-4 py-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={!isValidUrl || status === 'loading'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          The presentation must be publicly accessible.{' '}
          <a
            href="https://github.com/ilyamkin/pitchcom-pdf-downloader"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
          >
            View original project <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </div>
  );
}
