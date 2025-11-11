# 🎭 Fake Calendar Filler v2.0

A modern web application that creates fake calendar events using Google Calendar API. Perfect for testing, filling empty calendars, or adding some humor to your schedule!

## ✨ Features

- 🎯 **Event Categories**: Choose from Funny, Professional, or Random events
- 🌍 **Timezone Support**: Events created in your local timezone
- 📱 **Responsive Design**: Works beautifully on desktop and mobile
- 🔐 **Secure Google OAuth**: Safe authentication with Google Calendar
- 📊 **Event Management**: View, create, and delete fake events
- 🎨 **Modern UI**: Built with React and Tailwind CSS
- ⚡ **Real-time Updates**: Live status logging and feedback

## 🏗️ Architecture

- **Backend**: Node.js + Express + Google Calendar API
- **Frontend**: React + Vite + Tailwind CSS
- **Package Manager**: pnpm (recommended)
- **Deployment**: Production-ready build system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Google Calendar API credentials
- pnpm (recommended) or npm

### Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd fake-calendar-filler
pnpm run install:all
```

2. **Set up Google OAuth:**
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Calendar API
   - Create OAuth 2.0 credentials
   - Add `credentials.json` to the project root
   - Set redirect URI: `http://localhost:3000/oauth2callback`

3. **Start development servers:**
```bash
# Start both backend and frontend in development mode
pnpm run dev:full

# Or start them separately:
pnpm run dev          # Backend only
pnpm run frontend     # Frontend only
```

4. **Visit the app:**
   - Backend API: http://localhost:3000
   - Frontend: http://localhost:5174
   - Full app: http://localhost:3000 (in production mode)

## 📚 Available Scripts

### Development
- `pnpm run dev` - Start backend in development mode
- `pnpm run dev:full` - Start both backend and frontend
- `pnpm run frontend` - Start frontend development server
- `pnpm run preview` - Preview production build locally

### Production
- `pnpm run build` - Build frontend for production
- `pnpm run build:prod` - Build and verify production files
- `pnpm start` - Start production server
- `./deploy.sh` - Run deployment script

### Utilities
- `pnpm run status` - Check authentication status
- `pnpm run clean` - Clean build files and tokens
- `pnpm run backup` - Backup server configuration

## 🎮 How to Use

1. **Authorize**: Click "Authorize with Google" to connect your calendar
2. **Configure**: Choose event dates, count, and category
3. **Create**: Generate fake events with one click
4. **Manage**: View created events and delete them when done

### Event Categories

- **😄 Funny**: Humorous meeting titles like "Team Building Exercise (Mandatory Fun)"
- **💼 Professional**: Business-sounding meetings like "Project Status Review"
- **🎲 Random**: Mysterious activities like "Spontaneous Discovery"

## 🔧 Configuration

### Environment Variables
- `NODE_ENV=production` - Enable production mode
- `PORT=3000` - Server port (default: 3000)

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/oauth2callback`
6. Download credentials and save as `credentials.json`

## 🏗️ Project Structure

```
fake-calendar-filler/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # App entry point
│   ├── dist/               # Production build
│   └── package.json        # Frontend dependencies
├── public/                 # Legacy static files (dev fallback)
├── server.js              # Express backend
├── credentials.json       # Google OAuth credentials (add this)
├── token.json            # Stored OAuth tokens (auto-generated)
├── package.json          # Root dependencies and scripts
└── deploy.sh             # Deployment script
```

## 🐛 Troubleshooting

### Common Issues

1. **"credentials.json not found"**
   - Add your Google OAuth credentials to the project root

2. **"Invalid redirect URI"**
   - Make sure your Google Console has the correct redirect URI set

3. **"Tailwind CSS not working"**
   - Run `pnpm install:all` to ensure all dependencies are installed

4. **CORS errors in development**
   - The app includes proxy configuration for local development

### Logs and Debugging
- Check browser console for frontend errors
- Server logs show API requests and errors
- Use `pnpm run status` to check authentication state

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🔗 Links

- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [pnpm](https://pnpm.io/)

---

Made with ❤️ for humor-filled calendars 📅✨