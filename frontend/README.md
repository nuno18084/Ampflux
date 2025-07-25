# AmpFlux Frontend

A modern React-based frontend for the AmpFlux circuit design platform.

## Features

- **Modern React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching and caching
- **Authentication** with JWT tokens
- **Responsive Design** for all devices

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- React Query (TanStack Query)
- Axios
- Heroicons
- Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running on `http://localhost:8000`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
echo "VITE_API_URL=http://localhost:8000" > .env
```

3. Start development server:

```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx     # Main layout with navigation
│   ├── LoadingSpinner.tsx
│   └── ProtectedRoute.tsx
├── contexts/          # React contexts
│   ├── auth.ts       # Auth context definition
│   └── AuthProvider.tsx
├── hooks/            # Custom React hooks
│   └── useAuth.ts
├── lib/              # Utility libraries
│   ├── api.ts        # API client
│   └── queryClient.ts
├── pages/            # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ProjectPage.tsx
│   └── CircuitEditorPage.tsx
├── types/            # TypeScript type definitions
│   └── index.ts
├── App.tsx           # Main app component
└── main.tsx         # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Features

### Authentication

- User registration and login
- JWT token management
- Protected routes
- Automatic token refresh

### Project Management

- Create, view, and delete projects
- Project versioning
- Circuit data management

### Circuit Editor (Coming Soon)

- Visual circuit design
- Component library
- Real-time simulation
- Export functionality

### Dashboard

- Project overview
- Quick actions
- Statistics and metrics

## API Integration

The frontend communicates with the backend API through the `apiClient` in `src/lib/api.ts`. All API calls are handled with React Query for caching and state management.

## Styling

The application uses Tailwind CSS for styling with custom components defined in `src/index.css`. The design system includes:

- Primary color scheme (blue)
- Secondary color scheme (gray)
- Responsive breakpoints
- Custom component classes

## Development

### Adding New Pages

1. Create a new page component in `src/pages/`
2. Add the route to `src/App.tsx`
3. Update navigation if needed

### Adding New Components

1. Create the component in `src/components/`
2. Export it as a named export
3. Import and use in your pages

### API Integration

1. Add new API methods to `src/lib/api.ts`
2. Use React Query hooks in your components
3. Handle loading and error states

## Deployment

The application can be built for production using:

```bash
npm run build
```

This creates a `dist` folder with optimized static files that can be served by any web server.

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Add proper error handling
4. Test your changes thoroughly
5. Follow the established naming conventions
