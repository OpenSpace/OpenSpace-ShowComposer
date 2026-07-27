# OpenSpace Show Composer

## Overview

A visual drag-and-drop interface for creating and managing shows in OpenSpace. This application allows users to create, edit, and playback multi-page presentations with various interactive components that control and interact with the OpenSpace app.

## Stack

- React
- Vite
- Zustand (State Management)
- [Shadcn](https://ui.shadcn.com/docs)
- ESLint & Prettier
- OpenSpace js api (v0.9.11)

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm
- OpenSpace instance running 

## Installation

```sh
# Clone the repository
git clone [repository-url]
cd OpenSpace-ShowComposer

# Install dependencies
npm install
```

## Development Setup

The project saving/loading and image upload features are served by the OpenSpace WebGui
backend, which OpenSpace runs while it is up. There is no separate dev backend to start:

1. Have OpenSpace running (it serves the backend on `http://localhost:4680` by default).
2. Start the development server:
```sh
npm run dev
```

The dev server serves the app (with hot reload) at `http://localhost:<port>/showcomposer/`
and proxies the backend paths (`/showcomposer/api`, `/showcomposer/uploads`,
`/showcomposer/projects`) to the running OpenSpace backend, so saving/loading and image
upload work exactly as they do in production.

### Development Environment Notes

- If OpenSpace serves the backend on a different host or port, set the `SHOWCOMPOSER_BACKEND`
  environment variable to that origin when starting the dev server:
  ```sh
  SHOWCOMPOSER_BACKEND=http://localhost:4681 npm run dev
  ```
  (Or, for a persistent override, put `SHOWCOMPOSER_BACKEND=http://localhost:4681` in a
  gitignored `.env.local` file - you'd need to create it.)
- If OpenSpace is not running, the app still loads but the backend-dependent features
  (project save/load, image upload) will fail until it is.

## Production Setup

1. Build the application:
```sh
npm run build
```

2. The built application should be placed in the `user/showcomposer` folder in the production environment.

### Production Environment

In production, the application expects:

1. OpenSpace Connection:
   - OpenSpace instance running and accessible
   - WebSocket connection to OpenSpace (configurable via settings)
   - Default connection settings:
     - Host: Configurable via settings
     - Port: Configurable via settings

2. API Endpoints:
   - Project Management:
     - `POST /api/projects/save` - Save project data
     - `POST /api/projects/load` - Load project data
     - `GET /api/projects` - List available projects
     - `POST /api/projects/confirm-import` - Confirm project import

   - Image Management:
     - `GET /api/images` - Fetch gallery images
     - `POST /api/upload` - Upload new images

   - Project Export:
     - `POST /api/package` - Export project as ZIP file

## Component Categories

### Static Components
These components provide static content and information:
- **Title** - Add text headers to your show
- **Rich Text** - Add formatted text content
- **Image** - Display images in your show
- **Video** - Embed video content

### Preset Components
These components control OpenSpace visualization:
- **Multi** - Group multiple components together
- **Set Focus** 
- **Fade** 
- **Fly To** 
- **Set Time** - Control the simulation time
- **Set Navigation State** - Configure navigation parameters
- **Session Playback** - Play back recorded sessions
- **Action** - Trigger OpenSpace actions
- **Page** -Navigate to pages in your show
- **Script** - Execute custom LUA scripts

### Property Components
These components control specific OpenSpace properties:
- **Number** - Control numerical properties
- **Boolean** - Toggle boolean properties
- **Trigger** - Execute trigge properties

## Interface Features

### Layout Management
- Create and manage multiple layouts
- Drag and drop components into layouts
- Resize and reposition components
- Minimize/maximize panels

### Navigation Panels
- Time Panel - Control simulation time
- Navigation Panel - Control camera and camera movement properties
- Status Panel - View Simualtion Time and Lat/Lng/Alt
- Record Panel - Create and Playback recordings
- Log Panel - View realtime OpenSpace logs

### Show Management
- Multi-page show organization
- Page navigation
- Present mode for show playback
- Project saving and loading
- Image gallery management

## OpenSpace Integration

The application integrates with [openspace-api-js](https://github.com/OpenSpace/openspace-api-js) to provide visualization capabilities:

### Connection Management
- Automatic reconnection handling
- Connection state management
- Error handling and recovery
- Property subscription system

## Project Structure

The application uses a store-based architecture with Zustand:
- `useSettingsStore` - Manages application settings
- `useBoundStore` - Manages project-specific data and components
- `useOpenSpaceApiStore` - Manages OpenSpace api integration

### Key Components
- `Editor.tsx` - Main application interface
- `DraggableComponent` - Handles component dragging
- `DroppableWorkspace` - Manages component placement
- `LayoutContainer` - Manages component layouts
- `ComponentModal` - Component property editing
- `LayoutEditModal` - Layout configuration
- `Components/types/preset/*` - Action, Fade, FlyTo, Focus, Go to Page, Script, SessionPlayback, Nvationagion adn Set Time components
- `Components/types/property/*` - Boolean, Number and Trigger components
- `Components/types/static/*` - Helper Panels (Log,Sessions,Timedate,FlightContoller), as well as Image,Video,Title and RichText Components
