# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat mini-program carpool application built with uni-app, Vue 3, and TypeScript. The project uses the OpenSpec workflow for structured development.

## Development Commands

### WeChat Mini-Program Development
```bash
cd wechat-carpool-miniprogram
npm install                    # Install dependencies
npm run dev:mp-weixin         # Start WeChat mini-program dev mode
npm run build:mp-weixin       # Build for production
npm run type-check            # Run TypeScript type checking
```

### Other Platforms
```bash
npm run dev:h5                # H5 development
npm run build:h5              # H5 production build
```

### WeChat Developer Tools
After running `dev:mp-weixin`, import the `dist/dev/mp-weixin` directory in WeChat Developer Tools.

## Architecture

### Project Structure
```
wechat-carpool-miniprogram/
├── src/
│   ├── pages/              # Page components
│   │   ├── home/          # Home page (ride feed)
│   │   ├── publish/       # Publish ride page
│   │   ├── chat/          # Chat pages (list + detail)
│   │   └── profile/       # User profile pages
│   ├── components/        # Reusable components
│   │   ├── ride-card/    # Ride information card
│   │   ├── chat-item/    # Chat list item
│   │   └── user-card/    # User info card
│   ├── api/              # API layer
│   │   ├── ride.ts       # Ride-related APIs
│   │   ├── user.ts       # User-related APIs
│   │   └── chat.ts       # Chat-related APIs
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # Core types (Ride, User, Message, etc.)
│   ├── utils/            # Utility functions
│   │   └── request.ts    # HTTP request wrapper
│   ├── store/            # State management (Pinia)
│   ├── static/           # Static assets
│   ├── pages.json        # Page routing and TabBar config
│   └── manifest.json     # App configuration
```

### Core Types
- **RideType**: 'find-car' (passenger looking for ride) | 'find-passenger' (driver offering ride)
- **RideStatus**: 'pending' | 'ongoing' | 'completed' | 'cancelled'
- **Ride**: Main ride entity with location, time, seats, and user info
- **User**: User profile with rating and verification status
- **Message**: Chat message with type (text/image/location)
- **Chat**: Chat conversation summary
- **Statistics**: User statistics (total rides, distance, carbon reduction)

### API Layer
All API calls go through `utils/request.ts` which wraps `uni.request` with:
- Base URL configuration
- Request/response interceptors
- Error handling with toast notifications
- Token authentication (TODO)

Base URL is configured in `src/utils/request.ts` - update this for backend integration.

### Page Flow
1. **Home** → Browse rides (find-car or find-passenger mode)
2. **Publish** → Create new ride posting
3. **Chat** → Message list → Chat detail
4. **Profile** → User info → Records → Statistics

### TabBar Navigation
Four main tabs: Home, Publish, Chat, Profile. Icons should be placed in `src/static/images/` (81x81px recommended).

## OpenSpec Workflow

This project uses OpenSpec for structured development. Key commands:
- `/opsx:propose` - Propose a new change with all artifacts
- `/opsx:new` - Start a new change
- `/opsx:continue` - Continue working on a change
- `/opsx:apply` - Implement tasks from a change
- `/opsx:verify` - Verify implementation
- `/opsx:archive` - Archive completed change

OpenSpec artifacts are stored in `openspec/changes/`.

## Configuration Requirements

### Before Development
1. **WeChat AppID**: Update `src/manifest.json` → `mp-weixin.appid`
2. **Backend API**: Update `src/utils/request.ts` → `BASE_URL`
3. **TabBar Icons**: Add icons to `src/static/images/` (home, publish, chat, profile - normal and active states)

### Optional Integrations
- **Map Service**: Tencent Map or Amap (requires permission config in manifest.json)
- **IM Service**: Tencent Cloud IM SDK or custom WebSocket
- **State Management**: Pinia (install and configure in main.ts)

## Development Notes

### uni-app Specifics
- Use `uni.` APIs instead of browser APIs (e.g., `uni.request`, `uni.showToast`)
- Page routing configured in `pages.json`, not router files
- Platform-specific code can use conditional compilation (`#ifdef MP-WEIXIN`)

### TypeScript
- All types defined in `src/types/index.ts`
- Use `vue-tsc --noEmit` for type checking
- Strict mode enabled in `tsconfig.json`

### Vue 3 Composition API
- Use `<script setup lang="ts">` syntax
- Prefer Composition API over Options API
- Use `ref` and `reactive` for state management

### Performance
- Enable pull-down refresh in pages.json for list pages
- Use virtual lists for long ride lists
- Optimize images (webp format, compression)

### Security
- Never hardcode sensitive info (AppID, keys) in code
- Validate user input before API calls
- Add request signing for API security

## Pending Implementation

The following features are scaffolded but not fully implemented:
- Backend API integration (mock data currently)
- Map service integration
- IM service integration
- Payment functionality
- Push notifications
- Rating system backend
- Ride matching algorithm

## Language

This is a Chinese-language project. All UI text, comments, and documentation should be in Chinese (Simplified).
