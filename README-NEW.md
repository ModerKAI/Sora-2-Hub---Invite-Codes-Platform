# 🌩️ Sora 2 Hub - Marketplace & Giveaway Platform

A beautiful full-stack platform with loading screen, dual-mode marketplace and giveaway sections, just like formbiz.biz but in our style!

## 🎯 Features

✅ **Beautiful Loading Screen** - Video-based loader with progress  
✅ **Dual-Mode Platform** - Switch between Giveaway (🎁) and Marketplace (🛒)  
✅ **Fixed Header Navigation** - Cloud logo, tabs, search functionality  
✅ **Free Code Section** - Get codes with captcha verification  
✅ **Paid Code Section** - Purchase premium codes with multiple payment methods  
✅ **Responsive Design** - Works perfectly on all devices  
✅ **Modern UI/UX** - Clean, professional interface  
✅ **API Backend** - RESTful endpoints for both free and paid codes  

## 📁 Project Structure

```
sora_2/
├── public/           # Frontend files
│   ├── index.html    # Main page with dual sections
│   ├── css/style.css # Modern responsive styles
│   ├── js/main-new.js # App logic with navigation
│   └── assets/       # Images, videos, logos
├── server.js         # Express server with dual APIs
├── package.json      # Dependencies
└── README.md         # This file
```

## 🚀 Quick Start

Simply run:
```bash
cd sora_2
node server.js
```
Then open http://localhost:3001

That's it! One command, everything works!

## 📋 API Endpoints

### Free Codes (Giveaway)
- `GET /api/codes?type=free` - Get all free codes
- `POST /api/codes/:id/claim` - Claim a free code

### Paid Codes (Marketplace)  
- `GET /api/codes?type=paid` - Get all paid codes
- `POST /api/codes/:id/purchase` - Purchase a paid code

### General
- `GET /api/codes` - Get all codes (free + paid)
- `GET /api/health` - Health check

## 🎨 Logo Requirements

**For the cloud logo in the header:**
- **Format:** PNG with transparency
- **Size:** 40x40 pixels (perfect square)
- **Style:** Clean cloud icon, preferably minimalistic
- **Colors:** Should work on dark background
- **Location:** Save as `public/assets/cloud-logo.png`

The logo will be automatically rounded and will sit next to the "Sora 2 Hub" text in the navigation bar.

## 🎮 How It Works

1. **Loading Screen:** Beautiful video loader with progress indicator
2. **Navigation:** Fixed header with cloud logo and tab switching
3. **Giveaway Section:** 
   - Browse free codes
   - Click "Get Free" → Modal opens
   - Check captcha → Reveal code
4. **Marketplace Section:**
   - Browse premium codes with prices
   - Click "Buy Now" → Modal opens  
   - Choose payment method → Get premium code
5. **Search:** Real-time search across current section

## 🔧 Customization

- **Add your video:** Replace `public/assets/videos/loader.mp4`
- **Add your logo:** Add `public/assets/cloud-logo.png` (40x40px)
- **Modify codes:** Edit the arrays in `server.js`
- **Change colors:** Update CSS variables in `style.css`
- **Add payments:** Integrate real payment processors in purchase endpoint

Perfect balance of simplicity and functionality! 🎯