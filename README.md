# Poodiest

Poodiest is a recipe-sharing web application for discovering dishes, publishing recipes, and connecting with other home cooks. The web application is built with React 19, Vite, and Tailwind CSS 4, and communicates with the Poodiest backend API.

## Features

- Browse and search published recipes, including category and trending views
- View recipe ingredients, cooking steps, author profiles, and comments
- Create and manage recipes, with image uploads
- Sign in with Google and manage account and profile settings
- Choose a unique, case-insensitive username and update it from account settings
- Save and like recipes, and participate in recipe discussions
- Switch between light and dark themes
- Responsive layouts for desktop and mobile

## Requirements

- Node.js and npm
- The Poodiest backend API running locally or at a configured URL

## Quick start

From the repository root:

```bash
cd frontend
npm install
```

Create `frontend/.env` with the backend URL and Firebase web configuration, then
start the development server:

```bash
npm run dev
```

Vite serves the app at [http://localhost:5173](http://localhost:5173) by default.

## Configuration

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Set `VITE_BACKEND_URL` to the base URL of the running backend (without the
`/api` path). The backend must allow the frontend origin through its
`CORS_ORIGIN` configuration. Enable Google as the only provider in Firebase
Authentication and disable Email/Password and all other sign-in providers.
Add each local and deployed app domain to Firebase Authentication's authorized
domains. The Firebase web configuration values are public app configuration;
never put Firebase Admin private keys in the frontend.

For Vercel, set the project root directory to `frontend`, use `npm run build`
as the build command and `dist` as the output directory. Set
`VITE_BACKEND_URL` to the HTTPS origin of the Render API (without `/api` or a
trailing path). Production builds fail when this value is missing or is not an
HTTPS origin, rather than silently targeting localhost. Add the Vercel
production domain to the backend's `CORS_ORIGIN` allowlist and Firebase
Authentication's authorized domains. `vercel.json` rewrites client-side routes
to the SPA entry point so direct loads and refreshes work.

## Application routes

| Route                                     | Page                           | Access           |
| ----------------------------------------- | ------------------------------ | ---------------- |
| `/`                                       | Recipe feed                    | Public           |
| `/recipes`                                | All recipes and blogger search | Public           |
| `/recipe/:slug` or `/recipes/:slug`       | Recipe details                 | Public           |
| `/user/:username` or `/profile/:username` | User profile                   | Sign-in required |
| `/get-started`                            | Sign in with Google            | Public           |
| `/account`                                | Account and personal recipes   | Sign-in required |
| `/create-post`                            | Create a recipe                | Sign-in required |
| `/settings`                               | Account settings               | Sign-in required |

## Available commands

| Command           | Description                             |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Start the Vite development server       |
| `npm run build`   | Build the production bundle             |
| `npm run preview` | Preview the production build locally    |
| `npm run lint`    | Run ESLint                              |
| `npm run format`  | Format frontend files with Prettier     |
| `npm run check`   | Check frontend formatting with Prettier |

## Project structure

```text
frontend/
├── src/
│   ├── api/          # Backend API clients
│   ├── assets/       # Images and other static assets
│   ├── components/   # Shared UI components
│   ├── context/      # Authentication and theme state
│   ├── pages/        # Route-level views
│   ├── utils/        # Shared utilities
│   ├── App.jsx       # Shared application layout
│   └── main.jsx      # React entry point and route configuration
├── index.html
├── package.json
└── vite.config.js
```

## Related documentation

- [Backend API setup and endpoints](../backend/README.md)
