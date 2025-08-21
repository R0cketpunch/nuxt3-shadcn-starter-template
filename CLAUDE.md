# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build
- `npm install` - Install dependencies
- `npm run postinstall` - Prepare Nuxt (runs automatically after install)

## Architecture

This is a Nuxt 3 starter template with shadcn-vue components, featuring:

### Core Stack
- **Nuxt 3** (^3.17.6) - Full-stack Vue framework
- **Vue 3** (latest) - Progressive JavaScript framework  
- **TypeScript** - Type safety throughout
- **Tailwind CSS 4** (^4.1.11) - Utility-first styling with Vite plugin
- **Pinia** - State management store
- **VueUse** - Composition utilities

### UI Components
- **shadcn-nuxt** (^2.2.0) - Component system integration
- **Radix Vue** (^1.9.17) - Headless UI primitives
- **Reka UI** (^2.3.2) - Additional UI components
- **Lucide Vue Next** - Icon library (configured in components.json)
- **Radix Icons Vue** - Additional icons

### Key Configurations
- **Component Directory**: `./components/ui` for shadcn components
- **Aliases**: `@/components`, `@/lib/utils`, `@/composables` configured in components.json
- **Styling**: CSS variables with HSL color system, custom animations for accordions/collapsibles
- **Dark Mode**: Class-based with @nuxtjs/color-mode
- **Image Optimization**: @nuxt/image module enabled

### Project Structure
```
components/ui/     - shadcn-vue components (button, hover-card, etc.)
components/        - Custom Vue components (TheNavbar, TheFooter)
layouts/default.vue - Main layout wrapper
pages/             - File-based routing
lib/utils.ts       - Utility functions (cn() for class merging)
store/             - Pinia stores
assets/css/        - Global styles (tailwind.css)
```

### Game Features
- **Player Management**: Houses include optional playerName field for personalization
- **Timer System**: Audio/visual alerts with customizable phase durations
- **Turn Order**: Drag-and-drop Iron Throne track with player name display
- **State Persistence**: LocalStorage with export/import functionality
- **Responsive Design**: Mobile-first with tablet optimization

### Development Notes
- Uses Tailwind CSS 4 with Vite plugin (not PostCSS)
- shadcn components use "new-york" style with neutral base colors
- CSS variables enabled for theming
- TypeScript enabled throughout with strict configuration
- Component registration handled by shadcn-nuxt module
- Player names default to "Player X" if not provided during setup