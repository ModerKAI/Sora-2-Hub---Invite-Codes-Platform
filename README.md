# Sora 2 Code Giveaway - Simple Version

A beautiful and simple landing page with loading screen and basic backend for code distribution.

## Project Structure

```
sora_2/
├── public/           # Frontend files
│   ├── index.html    # Main page
│   ├── css/style.css # Styles
│   ├── js/main.js    # JavaScript logic
│   └── assets/       # Videos and other assets
├── server.js         # Express server (backend + static files)
├── package.json      # Dependencies
└── README.md         # This file
```

## Quick Start

**ONE COMMAND TO RUN EVERYTHING:**

```bash
node server.js
```

That's it! Website will be available at http://localhost:3001

## Features

✅ **Beautiful Loading Screen** - Video-based loader with progress indicator
✅ **Responsive Design** - Works on all devices  
✅ **Code Catalog** - Display available codes with statistics
✅ **Modal System** - Clean code claiming interface
✅ **Simple Backend** - In-memory data storage, no database needed
✅ **English Interface** - Clean and professional
✅ **Fallback System** - Works even if backend is offline

## API Endpoints

- `GET /api/codes` - Get all available codes
- `POST /api/codes/:id/claim` - Claim a specific code
- `GET /api/health` - Health check

## Customization

- Replace `assets/videos/loader.mp4` with your own loading video
- Modify `backend/simple-server.js` to change available codes
- Edit `landing/css/style.css` for styling changes

That's it! Simple, clean, and working. 🚀