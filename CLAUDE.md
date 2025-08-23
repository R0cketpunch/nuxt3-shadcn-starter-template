# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server at http://localhost:3000 (WebSocket server runs on port 3001)
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build
- `npm install` - Install dependencies
- `npm run postinstall` - Prepare Nuxt (runs automatically after install)

## Environment Variables

### WebSocket (Local Development)
- `NUXT_WS_PORT` - WebSocket server port (default: 3001)

### Pusher (Recommended for Production)
- `NUXT_PUBLIC_PUSHER_KEY` - Pusher public key
- `NUXT_PUBLIC_PUSHER_CLUSTER` - Pusher cluster (e.g., us2)
- `NUXT_PUSHER_APP_ID` - Pusher app ID (server-only)
- `NUXT_PUSHER_SECRET` - Pusher secret (server-only)

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
- **Faction Restrictions**: Enforces official player count limitations (3-6 players with specific factions)
- **Timer System**: Audio/visual alerts with customizable phase durations
- **Iron Throne Track**: Determines turn order for Action Phase resolution (Raid → March → Consolidate)
- **Turn Order Management**: Visual queue showing resolution order during Action sub-phases
- **State Persistence**: LocalStorage with export/import functionality
- **Real-time Sync**: Multi-tier synchronization (Pusher > WebSocket > SSE) with connection status indicator
- **Responsive Design**: Mobile-first with tablet optimization

### Faction Availability by Player Count
- **6 Players**: All factions (Stark, Lannister, Greyjoy, Tyrell, Baratheon, Martell)
- **5 Players**: All except Martell
- **4 Players**: All except Martell and Tyrell  
- **3 Players**: Only Stark, Lannister, and Baratheon
- **Automatic Filtering**: Setup page shows only available factions for selected player count
- **Balance Enforcement**: Prevents invalid faction combinations that could break game balance

### Starting Iron Throne Track Positions
- **6 Players**: Baratheon, Lannister, Stark, Martell, Greyjoy, Tyrell
- **5 Players**: Baratheon, Lannister, Stark, Greyjoy, Tyrell
- **4 Players**: Baratheon, Lannister, Stark, Greyjoy
- **3 Players**: Baratheon, Lannister, Stark
- **Fixed Setup**: Starting positions are predefined by official rules, not customizable during setup
- **Dynamic During Play**: Track order only changes through Westeros card effects during gameplay

### Iron Throne Track Mechanics
- **Primary Function**: Determines resolution order during Action Phase
- **Resolution Pattern**: ALL order types (Raid, March, Consolidate) resolve one-at-a-time in Iron Throne order
- **Cycling System**: Players cycle through turn order until all orders of current type are resolved
- **Tactical Balance**: Prevents any player from resolving all their orders before others can respond
- **Visual Indicators**: Track shows "ACTIVE" status during Action Phase with resolution queue
- **Player Tracking**: Current player highlighted, next player preview shown
- **Westeros Reordering**: Track becomes editable during Westeros phase for influence track updates

### Development Notes
- Uses Tailwind CSS 4 with Vite plugin (not PostCSS)
- shadcn components use "new-york" style with neutral base colors
- CSS variables enabled for theming
- TypeScript enabled throughout with strict configuration
- Component registration handled by shadcn-nuxt module
- Player names default to "Player X" if not provided during setup

### Additional Dependencies
- **@formkit/auto-animate** - Animation utilities
- **@number-flow/vue** - Number animation components
- **@tanstack/vue-table** - Table components
- **tw-animate-css** - Additional Tailwind animations
- **tailwindcss-animate** - Built-in animation utilities
- **pusher** - Server-side Pusher client for real-time events
- **pusher-js** - Client-side Pusher library
- **ws** - WebSocket server for local development
- **@types/ws** - TypeScript definitions for ws