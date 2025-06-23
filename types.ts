
// This file can be used to define shared TypeScript types and interfaces.
// For this application, types are mostly simple and defined inline or within components.

// Example: If we had a more complex transcript structure
export interface TranscriptSegment {
  startTime: string;
  endTime: string;
  text: string;
}

export interface FormattedTranscript {
  title?: string;
  segments: TranscriptSegment[];
  markdown: string;
}

// Currently, these types are not extensively used as the app handles strings directly for simplicity.
