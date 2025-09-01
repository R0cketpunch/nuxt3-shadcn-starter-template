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

This is a Game of Thrones board game management application built with Nuxt 3 and shadcn-vue components, featuring:

### Core Stack
- **Nuxt 3** (^3.17.6) - Full-stack Vue framework
- **Vue 3** (latest) - Progressive JavaScript framework  
- **TypeScript** - Type safety throughout
- **Tailwind CSS 4** (^4.1.11) - Utility-first styling with Vite plugin
- **Pinia** - State management store
- **VueUse** - Composition utilities
- **Pusher** - Real-time WebSocket communication for multiplayer sync

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
components/        - Game components (GameDisplay, GameController, InfluenceTrack, etc.)
layouts/default.vue - Main layout wrapper
pages/             - Game pages (index, control, setup, settings)
composables/       - Game state management (useGameState, useRealtimeSync, etc.)
types/game.ts      - TypeScript definitions for game entities
lib/utils.ts       - Utility functions (cn() for class merging)
server/api/        - Server endpoints for real-time sync
plugins/           - Pusher client configuration
public/sounds/     - Game audio files for timer and phase alerts
```

### Game Features
- **Real-time Multiplayer**: Pusher-based synchronization across multiple devices
- **Game Session Management**: Create/join game sessions with unique room codes
- **Player Management**: Houses include optional playerName field for personalization
- **Faction Restrictions**: Enforces official player count limitations (3-6 players with specific factions)
- **Timer System**: Audio/visual alerts for Assign Orders phase only (customizable duration, default 8 minutes, manual start from control page)
- **Iron Throne Track**: Determines turn order for Action Phase resolution (Raid → March → Consolidate)
- **Influence Track Management**: Three tracks (Iron Throne, Fiefdoms, King's Court) with drag-and-drop reordering
- **Dominance Tokens**: Visual representation of track leader benefits and abilities
- **Turn Order Management**: Visual queue showing resolution order during Action sub-phases
- **Wildling Threat Tracking**: 0-12 threat level with automatic attack triggers
- **State Persistence**: LocalStorage with export/import functionality
- **Audio System**: Sound effects for phase transitions, timer alerts, and game events
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
- Real-time sync uses Pusher WebSocket events with deduplication logic
- Game state is managed through composables with reactive updates
- Audio files are preloaded and cached for smooth gameplay experience
- Environment variables required: PUSHER_APP_ID, PUSHER_SECRET, PUSHER_KEY, PUSHER_CLUSTER

### Game Architecture
- **Central State Management**: `useGameState()` composable manages all game data
- **Real-time Synchronization**: `useRealtimeSync()` handles multiplayer communication
- **Audio Management**: `useGameAudio()` and `useGameSounds()` control sound effects
- **Timer System**: `useGameTimer()` manages phase timers with audio alerts
- **Type System**: Comprehensive TypeScript definitions in `types/game.ts` define all game entities
- **Phase Management**: Game flows through Westeros → Planning → Action phases with sub-phases
- **Turn Order Resolution**: Iron Throne track determines action resolution sequence
- **Event Deduplication**: Prevents duplicate timer actions in multiplayer scenarios

### Additional Dependencies
- **@formkit/auto-animate** - Animation utilities
- **@number-flow/vue** - Number animation components
- **@tanstack/vue-table** - Table components
- **tw-animate-css** - Additional Tailwind animations
- **tailwindcss-animate** - Built-in animation utilities