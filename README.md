# Poodiest

Poodiest is a recipe-sharing web application for discovering dishes, publishing recipes, and connecting with other home cooks. The web application is built with React 19, Vite, and Tailwind CSS 4, and communicates with the Poodiest backend API.

## Features

- Browse and search published recipes, including category and trending views
- View recipe ingredients, cooking steps, author profiles, and comments
- Create and manage recipes, with image uploads
- Register, sign in, and manage account and profile settings
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

Create `frontend/.env` with the backend URL, then start the development server:

```bash
npm run dev
```

Vite serves the app at [http://localhost:5173](http://localhost:5173) by default.

## Configuration

```env
VITE_BACKEND_URL=http://localhost:3000
```

Set `VITE_BACKEND_URL` to the base URL of the running backend (without the `/api` path). The backend must allow the frontend origin through its `CORS_ORIGIN` configuration.

## Application routes

| Route | Page | Access |
| --- | --- | --- |
| `/` | Recipe feed | Public |
| `/recipes` | All recipes | Public |
| `/recipe/:slug` or `/recipes/:slug` | Recipe details | Public |
| `/user/:username` or `/profile/:username` | Public user profile | Public |
| `/login` | Sign in | Public |
| `/signup` | Create an account | Public |
| `/account` | Account and personal recipes | Sign-in required |
| `/create-post` | Create a recipe | Sign-in required |
| `/settings` | Account settings | Sign-in required |

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format frontend files with Prettier |
| `npm run check` | Check frontend formatting with Prettier |

## Project structure

```text
frontend/
├── src/
│   ├── api/          # Backend API clients
│   ├── assets/       # Images and other static assets
│   ├── components/   # Shared UI components
│   ├── context/      # Authentication and theme state
│   ├── hooks/        # Reusable React hooks
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
