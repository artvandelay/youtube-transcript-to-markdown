import React, { useState, useCallback, useEffect } from 'react';
import { TextInput } from './components/TextInput';
import { Button } from './components/Button';
import { LoadingSpinner } from './components/LoadingSpinner';
import { YouTubeIcon, DownloadIcon, ErrorIcon, ShareIcon } from './components/IconComponents'; // ShareIcon can be re-used or replaced with a CopyIcon if desired
import { fetchMockTranscript, parseVttToMarkdown } from './services/transcriptService';
// Import geminiService to ensure its setup runs, though it's not directly used for transcript functionality.
import './services/geminiService'; // Ensure this runs to initialize GeminiAI if API_KEY is present

const App: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [markdownTranscript, setMarkdownTranscript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copyNotification, setCopyNotification] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!youtubeUrl) {
      setError('Please enter a YouTube video URL.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setMarkdownTranscript(null);
    setCopyNotification(null);

    try {
      // Basic URL validation (very simple)
      if (!youtubeUrl.includes('youtube.com/') && !youtubeUrl.includes('youtu.be/')) {
        throw new Error('Invalid YouTube URL format.');
      }
      const rawTranscript = await fetchMockTranscript(youtubeUrl);
      const formattedMarkdown = parseVttToMarkdown(rawTranscript);
      setMarkdownTranscript(formattedMarkdown);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      setMarkdownTranscript(null);
    } finally {
      setIsLoading(false);
    }
  }, [youtubeUrl]);

  const handleDownload = useCallback(() => {
    if (!markdownTranscript) return;

    const blob = new Blob([markdownTranscript], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transcript.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCopyNotification('Downloaded transcript.md!');
  }, [markdownTranscript]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!markdownTranscript) return;

    try {
      await navigator.clipboard.writeText(markdownTranscript);
      setCopyNotification('Transcript copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setCopyNotification('Failed to copy transcript. Please copy manually.');
      setError('Could not copy to clipboard. You might need to enable clipboard permissions for this site or copy manually.');
    }
  }, [markdownTranscript]);

  useEffect(() => {
    let timer: number; 
    if (copyNotification) {
      timer = window.setTimeout(() => {
        setCopyNotification(null);
      }, 3000); 
    }
    return () => clearTimeout(timer);
  }, [copyNotification]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 selection:bg-primary selection:text-white">
      <div className="bg-secondary p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-500 hover:scale-[1.01]">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <YouTubeIcon className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-primary to-primary-dark">
              Transcript Fetcher
            </h1>
          </div>
          <p className="text-gray-400">
            Enter a YouTube video URL to get its (mocked) transcript in Markdown format.
          </p>
        </header>

        <div className="space-y-6">
          <TextInput
            id="youtubeUrl"
            label="YouTube Video URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            disabled={isLoading}
            aria-describedby={error ? "error-message" : undefined}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !youtubeUrl}
            className="w-full bg-primary hover:bg-primary-dark focus:ring-primary-light"
            aria-label="Get transcript for the entered YouTube URL"
          >
            {isLoading ? <LoadingSpinner /> : 'Get Transcript'}
          </Button>
        </div>

        {error && (
          <div id="error-message" role="alert" className="mt-6 p-4 bg-red-700/30 border border-red-500 text-red-300 rounded-lg flex items-center space-x-2">
            <ErrorIcon className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {copyNotification && (
          <div role="status" aria-live="polite" className="mt-4 p-3 bg-blue-600/30 border border-blue-500 text-blue-200 rounded-lg text-center">
            {copyNotification}
          </div>
        )}

        {markdownTranscript && (
          <div className="mt-8 p-1">
            <h2 className="text-2xl font-semibold mb-3 text-gray-200">Formatted Transcript (Markdown)</h2>
            <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto border border-gray-700">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words selection:bg-accent selection:text-gray-900" aria-label="Formatted transcript text">{markdownTranscript}</pre>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500 flex items-center justify-center space-x-2"
                aria-label="Download transcript as a markdown file"
              >
                <DownloadIcon className="w-5 h-5" />
                <span>Download .md</span>
              </Button>
              <Button
                onClick={handleCopyToClipboard}
                className="w-full bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 flex items-center justify-center space-x-2"
                aria-label="Copy transcript to clipboard"
              >
                <ShareIcon className="w-5 h-5" /> {/* Using ShareIcon, could be replaced with a dedicated CopyIcon */}
                <span>Copy to Clipboard</span>
              </Button>
            </div>
          </div>
        )}
      </div>
       <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Made with &lt;3 and Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
