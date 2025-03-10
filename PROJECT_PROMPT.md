# Personal Journal Mobile Application

## Project Overview
A dynamic, socially-inspired personal media-rich diary application built with React Native and Expo, focusing on providing a seamless journaling experience with robust authentication and offline capabilities.

## Technical Stack
- **Frontend Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6 (Stack Navigator)
- **Authentication**: Firebase Authentication
- **State Management**: Local state with React hooks
- **UI Components**: Native components with custom styling
- **Development Environment**: Expo Go for easy testing and development

## Core Features

### Authentication System
- Clean authentication screen with email/password login
- Secure session management
- Protected routes and navigation
- Automatic redirection to home after successful login

### Journal Entry Management
- Create new journal entries with title and content
- View list of existing entries with dates
- Edit existing entries
- Delete entries
- Chronological sorting of entries

### User Interface
- **AuthScreen**: Minimalist login interface
- **HomeScreen**: 
  - List view of journal entries
  - New entry creation button
  - Logout functionality
  - Clean entry previews with titles and dates
- **EntryScreen**:
  - Rich text entry interface
  - Title and content fields
  - Save functionality
  - Navigation back to home

### Navigation Flow
```
AuthScreen (Initial Route)
    │
    ├── HomeScreen
    │      │
    │      └── EntryScreen (New Entry)
    │      │
    │      └── EntryScreen (Edit Entry)
    │
    └── (Logout returns to AuthScreen)
```

## Data Models

### JournalEntry
```typescript
interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  userId: string;
}
```

### Navigation Types
```typescript
type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Entry: {
    entryId?: string;
  };
};
```

## UI/UX Design Principles
- Clean, minimalist interface
- Consistent color scheme (primary: #007AFF)
- Responsive layouts
- Native-feeling interactions
- Clear visual hierarchy
- Intuitive navigation

## Planned Enhancements
1. Push Notifications
   - Integration with Expo Notifications
   - Reminders for daily journaling
   - Custom notification scheduling

2. Offline Support
   - Local storage using Expo SQLite
   - Data synchronization when online
   - Offline editing capabilities

3. Media Integration
   - Camera integration using Expo Camera
   - Image attachment to entries
   - Media gallery management

4. Rich Text Editing
   - Formatting options
   - Markdown support
   - Text styling capabilities

## Development Guidelines

### Code Structure
```
mobile/
├── src/
│   ├── navigation/
│   │   └── types.ts
│   ├── screens/
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── EntryScreen.tsx
│   ├── components/
│   │   └── (future UI components)
│   └── utils/
│       └── (helper functions)
├── App.tsx
└── app.json
```

### Best Practices
1. Type Safety
   - Use TypeScript strictly
   - Define interfaces for all data structures
   - Maintain type definitions for navigation

2. Component Structure
   - Functional components with hooks
   - Props interface definitions
   - Consistent styling patterns

3. State Management
   - Local state for simple data
   - Context for shared state
   - Async storage for persistence

4. Error Handling
   - Try-catch blocks for async operations
   - User-friendly error messages
   - Graceful fallbacks

### Testing Requirements
- Component unit tests
- Navigation flow testing
- Authentication flow verification
- Offline functionality testing
- Device compatibility testing

## Development Workflow
1. Feature Development
   - Branch creation
   - Implementation
   - Testing
   - Code review
   - Merge

2. Testing Process
   - Local testing with Expo Go
   - Device testing
   - User acceptance testing

3. Deployment
   - Version bumping
   - Build generation
   - Store submission

## Environment Setup
1. Development Requirements
   - Node.js
   - Expo CLI
   - React Native development environment
   - Mobile device with Expo Go

2. Configuration
   - Environment variables
   - Firebase configuration
   - Expo configuration in app.json

This prompt serves as a comprehensive guide for developing and maintaining the Personal Journal Mobile application, ensuring consistency in development practices and feature implementation.
