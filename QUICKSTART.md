# Clarity - Quick Start Guide

## 30-Second Setup

```bash
# 1. Install dependencies
npm install

# 2. Build the app
npm run build

# 3. Start development server (optional)
npm start
```

## Getting the Android APK

### Easiest Path: Web-based Installation
No Android Studio needed. Just add to your home screen.

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy the `build/` folder to any free hosting:
   - **Firebase Hosting** (recommended)
   - Vercel
   - Netlify
   - Any web server

3. On your Android phone, open Chrome and:
   - Go to your hosted URL
   - Tap the menu (⋮)
   - Tap "Add to Home screen"
   - The app appears on your home screen just like a native app

### Full Native APK (Advanced)

If you want a true native APK:

1. Install Android Studio (free download)

2. Run:
   ```bash
   npm run cap:add:android
   npm run cap:build
   npm run cap:open:android
   ```

3. In Android Studio:
   - Wait for build to complete
   - Click "Build" → "Generate Signed Bundle/APK"
   - Choose "APK" and follow prompts
   - APK will be generated and ready to install

## What You Get

✅ No ads  
✅ No cloud sync needed  
✅ No tracking  
✅ All data stays on your phone  
✅ Gorgeous zen interface  
✅ Full task management  
✅ Export your data anytime  

## Features at a Glance

- **Add tasks** - Type and press Enter
- **Complete tasks** - Click checkbox
- **Edit tasks** - Double-click
- **Focus mode** - See only today
- **Dark/Light** - Toggle theme
- **Export data** - Download as JSON
- **Search/Filter** - Find by tags
- **Undo** - 30 seconds of undo

## Troubleshooting

**Port 3000 already in use?**
```bash
PORT=3001 npm start
```

**Android Studio build fails?**
- Make sure you have JDK 11+ installed
- Check that Android SDK is properly installed
- Run `npm run cap:update` before building

**Data not persisting?**
- Check browser storage isn't blocked
- Try a different browser (Chrome works best)
- Make sure JavaScript is enabled

## Support

This is your personal app. Modify it however you like. All code is yours to keep and adapt.

---

**Ready? Start with:** `npm install && npm run build`
