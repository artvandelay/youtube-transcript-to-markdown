# YouTube Transcript to Markdown

This web application allows users to (currently, through mocked functionality) "fetch" a YouTube video transcript and convert it into Markdown format. It features options to download the Markdown content or copy it to the clipboard.

The application is built with React, TypeScript, and Tailwind CSS. It also includes an initialization setup for the Google Gemini API, though the core transcript functionality currently uses mock data.

## Features

-   Enter a YouTube video URL (mock processing).
-   Fetches and displays a (mocked) transcript.
-   Formats the transcript into Markdown.
-   Download the Markdown transcript as a `.md` file.
-   Copy the Markdown transcript to the clipboard.
-   Responsive design.
-   Loading states and error handling.
-   Notifications for actions like copy/download.

## Tech Stack

-   **Frontend:** React 18, TypeScript
-   **Styling:** Tailwind CSS
-   **Build/Module System:** ES Modules via import maps in `index.html` (suitable for modern browsers, no explicit build step for development in this setup).
-   **API (Optional):** Google Gemini API (setup included in `services/geminiService.ts` but not used by the core mock transcript functionality).

## Prerequisites

Before you begin, ensure you have the following installed on your Mac:

1.  **Node.js**: This application relies on Node.js and its package manager, npm (or yarn). You can download Node.js from [nodejs.org](https://nodejs.org/) or install it using a package manager like Homebrew (`brew install node`).
    -   Verify installation:
        ```bash
        node -v
        npm -v
        ```

## Setup Instructions

1.  **Clone the Repository (if applicable)**
    If you haven't already, and you received these files as part of a project, make sure they are in a dedicated folder on your local machine.

2.  **API Key for Google Gemini (Optional)**
    This application includes a service (`services/geminiService.ts`) that attempts to initialize the Google Gemini AI SDK. The core transcript functionality **uses mock data** and does **not** require this API key to run.
    However, if you intend to extend the application to use actual Gemini features, you'll need an API key.

    *   Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   The application expects the API key to be available as an environment variable named `API_KEY`.
    *   **Important**: For client-side applications, directly embedding API keys or relying on `process.env` in the browser is generally insecure for production. This setup assumes `process.env.API_KEY` would be handled by a build tool or server-side environment if it were a production app using the API key. For local development where you are running a dev server that might substitute this (like Vite or Create React App, which are not used here), it could work.
    *   Given the current direct ES module setup, `process.env.API_KEY` will likely be `undefined` in the browser. If you want to test the Gemini initialization, you would typically need a development server that can inject environment variables or a build process. For simplicity with the current structure, the Gemini service will show a console warning if the key is not found, but the app will still function with mock data.

3.  **Install Dependencies**
    This project uses ES modules and an `importmap` in `index.html` to load React and other dependencies directly from a CDN (esm.sh). Therefore, there's **no `npm install` step required** for these external libraries.

    If you were to add local development tools (like a linter, prettier, or a dev server like `vite`), you would then initialize a `package.json` (`npm init -y`) and install those dev dependencies.

## Running the Application Locally

Since this application is designed to run directly in the browser using ES modules and does not have a dedicated Node.js backend or a complex build step for its current functionality:

1.  **Serve the `index.html` file:**
    You need a simple HTTP server to serve the `index.html` and its associated `.tsx` files. Browsers have security restrictions (CORS) that prevent `file:///` URLs from loading modules correctly.

    *   **Using `npx` (comes with npm):**
        Open your terminal, navigate to the root directory of the project (where `index.html` is located), and run:
        ```bash
        npx http-server -c-1
        ```
        The `-c-1` flag disables caching, which is helpful for development.
        This will typically start a server on `http://localhost:8080`. Open this URL in your web browser.

    *   **Using Python (if installed):**
        If you have Python 3:
        ```bash
        python3 -m http.server
        ```
        If you have Python 2:
        ```bash
        python -m SimpleHTTPServer
        ```
        This will usually start a server on `http://localhost:8000`.

    *   **Using VS Code Live Server Extension:**
        If you are using Visual Studio Code, you can install the "Live Server" extension. Once installed, right-click on the `index.html` file in the VS Code explorer and select "Open with Live Server".

2.  **Open in Browser:**
    Once the server is running, open the provided URL (e.g., `http://localhost:8080` or `http://localhost:8000`) in your web browser.

## How it Works (Current Mock Implementation)

-   You enter any text into the YouTube URL input field.
-   Clicking "Get Transcript" simulates an API call (with a delay).
-   It then uses a predefined VTT (Video Text Track) formatted string as mock transcript data.
-   This VTT data is parsed into a simple Markdown structure (timestamps as bold, text on new lines).
-   The Markdown is displayed in a `<pre>` tag.
-   You can then download this Markdown or copy it to your clipboard.

## Note on `yt-dlp`

The initial user request mentioned `yt-dlp`. This application **does not** actually use `yt-dlp` or any other backend service to fetch live YouTube transcripts. The transcript fetching and parsing are currently **mocked** within `services/transcriptService.ts` for frontend demonstration purposes. To implement actual transcript fetching, a backend component capable of running `yt-dlp` and serving its output would be required.

---

This README provides a basic guide. For a more robust development environment, you might consider setting up a project with Vite or Create React App, which offer features like hot module reloading, optimized builds, and easier environment variable management.
