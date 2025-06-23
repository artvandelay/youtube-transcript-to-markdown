// Client-side transcript service for GitHub Pages deployment
// This uses YouTube's internal transcript API directly from the browser

interface TranscriptItem {
  text: string;
  start: number;
  dur: number;
}

// Extract video ID from YouTube URL
function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  if (!match) {
    throw new Error('Invalid YouTube URL format');
  }
  return match[1];
}

// Fetch transcript using YouTube's internal API
export const fetchTranscript = async (youtubeUrl: string): Promise<string> => {
  if (!youtubeUrl.trim()) {
    throw new Error('URL cannot be empty.');
  }

  try {
    const videoId = extractVideoId(youtubeUrl);
    
    // First, get the video page to extract transcript data
    const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!videoPageResponse.ok) {
      throw new Error('Failed to fetch video page');
    }
    
    const videoPageText = await videoPageResponse.text();
    
    // Extract captions data from the page
    const captionsRegex = /"captions":(\{.*?\})\}/;
    const match = videoPageText.match(captionsRegex);
    
    if (!match) {
      throw new Error('No captions found for this video. The video may not have subtitles available.');
    }
    
    try {
      const captionsData = JSON.parse(match[1] + '}');
      const captionTracks = captionsData?.playerCaptionsTracklistRenderer?.captionTracks;
      
      if (!captionTracks || captionTracks.length === 0) {
        throw new Error('No caption tracks available for this video.');
      }
      
      // Find English captions or use the first available
      let captionTrack = captionTracks.find((track: any) => 
        track.languageCode === 'en' || track.languageCode === 'en-US'
      ) || captionTracks[0];
      
      if (!captionTrack.baseUrl) {
        throw new Error('Caption track URL not found.');
      }
      
      // Fetch the actual transcript
      const transcriptResponse = await fetch(captionTrack.baseUrl);
      if (!transcriptResponse.ok) {
        throw new Error('Failed to fetch transcript data');
      }
      
      const transcriptXml = await transcriptResponse.text();
      
      // Parse XML and convert to VTT format
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(transcriptXml, 'text/xml');
      const textElements = xmlDoc.getElementsByTagName('text');
      
      if (textElements.length === 0) {
        throw new Error('No transcript text found in the response.');
      }
      
      // Convert to VTT format
      let vttContent = 'WEBVTT\n\n';
      
      for (let i = 0; i < textElements.length; i++) {
        const element = textElements[i];
        const start = parseFloat(element.getAttribute('start') || '0');
        const dur = parseFloat(element.getAttribute('dur') || '3');
        const text = element.textContent || '';
        
        // Format timestamps
        const startTime = formatTime(start);
        const endTime = formatTime(start + dur);
        
        vttContent += `${startTime} --> ${endTime}\n`;
        vttContent += `${text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}\n\n`;
      }
      
      return vttContent;
      
    } catch (parseError) {
      throw new Error('Failed to parse captions data from video page.');
    }
    
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred while fetching the transcript.');
  }
};

// Helper function to format seconds to VTT timestamp format
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

// Keep the existing VTT parsing function
export const parseVttToMarkdown = (vttContent: string): string => {
  const lines = vttContent.split('\n');
  let markdown = '# Video Transcript\n\n';
  let currentTimestamp = '';
  let currentText = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip WEBVTT header and empty lines
    if (line === 'WEBVTT' || line === '' || line.startsWith('NOTE')) {
      continue;
    }

    // Check if line contains timestamp (format: 00:00:00.000 --> 00:00:00.000)
    if (line.includes('-->')) {
      // If we have previous content, add it to markdown
      if (currentTimestamp && currentText) {
        markdown += `**${currentTimestamp}**\n${currentText}\n\n`;
      }
      
      // Extract start timestamp
      currentTimestamp = line.split(' --> ')[0];
      currentText = '';
    } else if (line && !line.includes('-->')) {
      // This is transcript text
      if (currentText) {
        currentText += ' ' + line;
      } else {
        currentText = line;
      }
    }
  }

  // Add the last entry
  if (currentTimestamp && currentText) {
    markdown += `**${currentTimestamp}**\n${currentText}\n\n`;
  }

  return markdown;
};

// Backward compatibility
export const fetchMockTranscript = fetchTranscript;
