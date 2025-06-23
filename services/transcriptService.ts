
// This service simulates fetching a transcript and parsing it.
// In a real application, this would interact with a backend service
// that uses a tool like yt-dlp.

const MOCK_VTT_TRANSCRIPT = `WEBVTT

00:00:00.500 --> 00:00:04.200
Hello everyone, and welcome to this demonstration video!

00:00:04.800 --> 00:00:08.500
Today, we're showcasing a (mocked) transcript extraction feature.

00:00:09.000 --> 00:00:13.000
This text is pre-defined and simulates what yt-dlp might provide.
It's great for testing UI.

00:00:13.500 --> 00:00:15.000
Let's see how it looks.
`;

const MOCK_ERROR_VTT_TRANSCRIPT_INVALID_URL = `ERROR: Invalid URL`;
const MOCK_ERROR_VTT_TRANSCRIPT_UNAVAILABLE = `ERROR: Transcript unavailable`;


export const fetchMockTranscript = (youtubeUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (youtubeUrl.includes('error_invalid_url')) {
        reject(new Error('Mock Error: The YouTube URL provided is invalid.'));
      } else if (youtubeUrl.includes('error_unavailable_transcript')) {
        reject(new Error('Mock Error: Transcript is unavailable for this video.'));
      } else if (!youtubeUrl.trim()) {
        reject(new Error('URL cannot be empty.'));
      }
      // Simulate success
      resolve(MOCK_VTT_TRANSCRIPT);
    }, 1000 + Math.random() * 1000); // Simulate network delay
  });
};

export const parseVttToMarkdown = (vttContent: string): string => {
  const lines = vttContent.split('\\n');
  let markdownString = '';
  let currentCaption = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === 'WEBVTT' || trimmedLine === '') {
      // Skip VTT header or empty lines between captions
      if (currentCaption) {
          markdownString += currentCaption.trim() + '\\n\\n';
          currentCaption = '';
      }
      continue;
    }

    // Check if the line is a timestamp
    // Regex for VTT timestamp: HH:MM:SS.mmm --> HH:MM:SS.mmm (optional hours)
    const timestampRegex = /^(?:(\d{2,}):)?([0-5]\d):([0-5]\d)\.(\d{3})\s*-->\s*(?:(\d{2,}):)?([0-5]\d):([0-5]\d)\.(\d{3})/;
    if (timestampRegex.test(trimmedLine)) {
      // If we have a pending caption, add it first
      if (currentCaption) {
        markdownString += currentCaption.trim() + '\\n\\n';
        currentCaption = '';
      }
      // Add timestamp as bold
      markdownString += `**${trimmedLine}**\\n`;
    } else {
      // This is a caption text line
      if (currentCaption) {
        currentCaption += ' ' + trimmedLine; // Append to multi-line caption
      } else {
        currentCaption = trimmedLine;
      }
    }
  }
  
  // Add any remaining caption
  if (currentCaption) {
    markdownString += currentCaption.trim() + '\\n\\n';
  }

  return markdownString.trim(); // Remove trailing newlines
};
