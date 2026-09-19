# 🎨 Poodiest - Frontend Web Application

The frontend client for Poodiest is a responsive web application built with **React 19**, **Vite**, **Tailwind CSS v4**, and **React Router v8**.

---

## 🚀 Key Features

- **Dynamic Recipe Discovery**: Grid and card layouts for exploring recipes, filtered by category tags or searched via instant live query.
- **Interactive Recipe Detail View**: Displays ingredients, step-by-step cooking instructions, prep/cook times, servings, and interactive comment sections.
- **Recipe Management**: Create, edit, and delete recipe posts with live image upload previews powered by Cloudinary.
- **User Authentication & Session Handling**: Auth forms for Login/Signup, automatic token restoration, and Axios interceptors for handling 401 token refresh automatically.
- **User Profiles & Account Settings**: Customize avatar, display name, bio, and change password.
- **Theme Switcher**: Dark/Light mode support with CSS custom variables and persistent theme context.
- **Responsive Navigation**: Full desktop navbar + mobile drawer navigation.

---

## 📁 Project Structure

```text
frontend/
├── src/
│   ├── api/
│   │   ├── axios.js           # Main Axios instance for authenticated user endpoints
│   │   └── recipeApi.js       # Public & authenticated recipe service helpers
│   ├── components/
│   │   ├── CommentSection.jsx # Recipe page interactive comment list & input
│   │   ├── EditRecipeModal.jsx# Modal for editing published recipes
│   │   ├── ImageUploadModal.jsx# Modal interface for uploading images
│   │   ├── Navbar.jsx         # Header navbar with mobile drawer navigation
│   │   ├── ProtectedRoute.jsx # Route guard for authenticated pages
│   │   ├── RecipeCard.jsx     # Recipe feed display card
│   │   └── UserSearchModal.jsx# User search lookup modal
│   ├── context/
│   │   ├── AuthContext.jsx    # Authentication provider & state
│   │   └── ThemeContext.jsx   # Dark/Light theme provider & state
│   ├── pages/
│   │   ├── Account.jsx        # User account management & personal posts
│   │   ├── CreatePost.jsx     # Recipe creation page
│   │   ├── Login.jsx          # Login view
│   │   ├── RecipeDetail.jsx   # Single recipe page
│   │   ├── RecipeFeed.jsx     # Homepage recipe feed & discovery
│   │   ├── Settings.jsx       # Preferences & settings
│   │   ├── Signup.jsx         # Signup view
│   │   └── UserProfile.jsx    # Public author profile page
│   ├── App.jsx                # Layout wrapper component
│   ├── index.css              # Global styles & Tailwind CSS directives
│   └── main.jsx               # App entry point & Router configuration
├── .env                       # Environment variables
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:3000
```

---

## 🏃 Running the Client

### Development Mode
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Code Quality Commands
```bash
npm run lint     # Run ESLint check
npm run format   # Format code using Prettier
npm run check    # Verify Prettier compliance
```
