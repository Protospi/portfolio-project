# Language Detection Backend

This is an Express.js backend application that provides language detection functionality using OpenAI's API.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3001
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Running the Server

For development (with auto-reload):
```
npm run dev
```

For production:
```
npm start
```

## API Endpoints

### Language Detection

`POST /api/language-detection`

Request body:
```json
{
  "text": "The text you want to analyze for language detection"
}
```

Response:
```json
{
  "language": "English",
  "rawResponse": {
    "role": "assistant",
    "content": "English"
  }
}
```

## Adding New Routes

To add new routes:
1. Create a new file in the `routes` directory
2. Import and add it to the main `server.js` file 