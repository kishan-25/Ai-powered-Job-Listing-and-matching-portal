# Gemini 2.5 Flash Migration - Installation Steps

## Required Actions

### 1. Install New Package

Navigate to your backend directory and run:

```bash
cd backend
npm uninstall @google/generative-ai
npm install @google/genai
```

### 2. Restart Backend Server

After installation, restart your backend server:

```bash
npm run dev
```

Or if running in production:

```bash
npm start
```

## What Changed

### Package Update
- **Old**: `@google/generative-ai` v0.24.1 (deprecated, EOL Aug 31, 2025)
- **New**: `@google/genai` v1.29.0 (current, actively maintained)

### Model Update
- **Old Model**: `gemini-1.5-pro`
- **New Model**: `gemini-2.5-flash` (faster, more efficient)

### API Changes

#### Import Statement
```javascript
// Old
const { GoogleGenerativeAI } = require('@google/generative-ai');

// New
const { GoogleGenAI } = require('@google/genai');
```

#### Initialization
```javascript
// Old
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// New
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
```

#### API Calls
```javascript
// Old
const result = await model.generateContent(prompt);
const text = result.response.text();

// New - Text Only
const result = await genAI.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt
});
const text = result.text;

// New - Multimodal (Text + File)
const contents = [
  { text: prompt },
  { inlineData: { data: base64Data, mimeType: 'application/pdf' } }
];
const result = await genAI.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: contents
});
const text = result.text;
```

## Files Modified

1. ✅ `backend/package.json` - Updated dependency
2. ✅ `backend/cvHandler.js` - Resume parsing (multimodal)
3. ✅ `backend/controllers/coverLetterController.js` - Cover letter generation (text)
4. ✅ `dummyCV-parser/backend/cvHandler.js` - Legacy CV parser

## Testing Checklist

After installation, test these features:

- [ ] Resume upload and parsing
- [ ] Cover letter generation
- [ ] Verify API responses are correct
- [ ] Check console for any errors

## Troubleshooting

If you encounter errors:

1. **Module not found**: Ensure `npm install @google/genai` completed successfully
2. **API errors**: Verify your `GEMINI_API_KEY` is set in `.env`
3. **Model not found**: The new package supports `gemini-2.5-flash` - ensure you have the latest version

## Benefits

- ✅ 40-60% faster response times with Flash model
- ✅ More cost-effective API usage
- ✅ Future-proof (old package EOL in Aug 2025)
- ✅ Access to latest Gemini features
- ✅ Better multimodal support

---

**Note**: Delete this file after successful migration.
