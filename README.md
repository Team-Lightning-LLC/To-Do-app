# Clarity: A Zen To-Do App

A premium, minimalist to-do app with zero noise, zero ads, pure functionality. Built with React and Capacitor for Android.

## Features

✨ **Pure Functionality**
- Quick task capture with no friction
- Smart sorting (due date, completion status)
- Recurring tasks (daily, weekly, monthly, custom)
- Subtasks for complex work
- Tags and contexts (work, personal, urgent, etc.)
- Due dates and time awareness
- Focus Mode (show only today's tasks)

🎨 **Zen Design**
- Soothing, balanced aesthetic
- Gentle animations and smooth transitions
- Dark/Light mode toggle
- Clean typography with proper spacing
- Reduces cognitive load

🛡️ **Your Data is Yours**
- Local storage only (device-based, no cloud)
- Export data as JSON anytime
- Zero tracking, zero analytics
- No subscriptions, no ads

⌨️ **Power User Features**
- Keyboard shortcuts
- Undo (30 seconds)
- Double-click to edit
- Search and filter by tags
- 30-second undo for deletions

## Setup & Build

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Android SDK (if building Android APK)
- Java Development Kit (JDK 11+)

### Installation

1. **Navigate to project directory**
   ```bash
   cd path/to/clarity
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the web app**
   ```bash
   npm run build
   ```

### Building for Android

#### Option 1: Using Capacitor (Recommended)

1. **Initialize Capacitor**
   ```bash
   npx cap init
   ```

2. **Add Android platform**
   ```bash
   npm run cap:add:android
   ```

3. **Build and sync**
   ```bash
   npm run cap:build
   ```

4. **Open Android Studio**
   ```bash
   npm run cap:open:android
   ```

5. **In Android Studio:**
   - Select "Build" → "Generate Signed Bundle/APK"
   - Choose "APK"
   - Follow the prompts to sign with your keystore
   - Choose "release" variant
   - APK will be generated in `android/app/release/`

#### Option 2: Web-based Android App (Quick Testing)

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy the `build/` folder to any static hosting (Firebase, Netlify, Vercel)

3. Add to your Android home screen:
   - Open Chrome on Android
   - Navigate to your hosted URL
   - Tap menu → "Add to Home screen"
   - Tap "Add"

### Development

For local development:
```bash
npm start
```

This opens the app at `http://localhost:3000` with hot reload.

## Usage

### Adding Tasks
- Type in the input field and press Enter
- Or click "Add Task"

### Completing Tasks
- Click the checkbox next to a task
- Completed tasks move to the bottom

### Editing Tasks
- Double-click any task to edit inline
- Press Enter to save

### Tags
- Add tags in task text like: "Buy groceries #shopping #urgent"
- Filter by tag using the search box

### Focus Mode
- Click "Focus" button to see only today's tasks
- Click "All" to see everything

### Dark/Light Mode
- Toggle with the sun/moon icon

### Export Data
- Click the download icon to export all tasks as JSON
- Use this as backup or for manual migration

### Keyboard Shortcuts
- **Enter** - Add new task
- **Double-click** - Edit task
- **Escape** - Cancel edit

## Data

All data is stored locally in your browser's localStorage. Your tasks never leave your device.

To backup:
1. Click the download icon
2. Save the JSON file

To restore:
- Replace localStorage with exported JSON (or request feature to import)

## Privacy

- No tracking
- No analytics
- No cloud sync
- No ads
- No subscriptions
- Zero external dependencies (except React & icons library)

## Architecture

Built with:
- **React 18** - UI framework
- **Capacitor 5** - Android deployment
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **LocalStorage** - Data persistence

## License

Personal use only. This app is designed for you.

---

**Made with intention. No noise. Pure clarity.**
