# CEMSE Entrepreneurship System - Mobile Implementation Specification

## Executive Summary

This document provides a comprehensive analysis of the CEMSE web application's entrepreneurship ecosystem for YOUTH users. The entrepreneurship system is a multi-faceted platform that includes project management, networking, messaging, directory browsing, resource sharing, and business plan development. This specification enables pixel-perfect mobile replication of all entrepreneurship features for YOUTH role users.

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Core Components Analysis](#core-components-analysis)
3. [Data Models and Types](#data-models-and-types)
4. [API Integration Specifications](#api-integration-specifications)
5. [State Management Patterns](#state-management-patterns)
6. [UI/UX Components for Mobile](#uiux-components-for-mobile)
7. [Real-time Features and Messaging](#real-time-features-and-messaging)
8. [Mobile-Specific Considerations](#mobile-specific-considerations)
9. [Implementation Roadmap](#implementation-roadmap)

## System Architecture Overview

### Routing Structure

The entrepreneurship system follows a hierarchical routing pattern:

```
/entrepreneurship
├── / (main dashboard)
├── /[id] (project detail view)
├── /[id]/edit (project edit form)
├── /directory (institution directory)
├── /directory/[id] (institution profile)
├── /directory/[id]/posts/[postId] (institution post detail)
├── /messaging (messaging interface)
├── /network (networking/contacts)
└── /resources (resource library)
```

### Component Hierarchy

```
EntrepreneurshipSystem
├── MainDashboard
│   ├── HeroSection
│   ├── QuickActions (4 cards)
│   ├── TabsInterface
│   │   ├── ResourcesTab
│   │   └── ProgramsTab
│   └── CallToAction
├── ProjectDetailView
│   ├── HeaderActions
│   ├── MainContent
│   └── Sidebar
├── ProjectEditForm
│   ├── BasicInformation
│   ├── LocationContact
│   ├── BusinessDetails
│   └── SocialMediaVisibility
├── DirectorySystem
│   ├── InstitutionsList
│   ├── InstitutionProfile
│   └── InstitutionPosts
├── MessagingInterface
│   ├── ConversationsList
│   └── ChatWindow
├── NetworkingSystem
│   ├── StatsCards
│   ├── TabsInterface
│   │   ├── EntrepreneursTab
│   │   ├── RequestsTab
│   │   ├── ContactsTab
│   │   ├── DiscussionsTab
│   │   └── OrganizationsTab
└── ResourcesLibrary
    ├── SearchFilters
    ├── TabsInterface
    └── ResourceCards
```

## Core Components Analysis

### 1. Main Entrepreneurship Dashboard

**File:** `src/app/(dashboard)/entrepreneurship/page.tsx`

**Key Features:**
- Hero section with gradient background and call-to-action
- 4 quick action cards (Business Plan Simulator, Resources, Network, Mentorship)
- Tabbed interface for Resources and Programs
- Mock data implementation with TODO comments for real API integration

**State Management:**
```typescript
const [resources, setResources] = useState<Resource[]>([]);
const [programs, setPrograms] = useState<Program[]>([]);
const [stories, setStories] = useState<SuccessStory[]>([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState("");
```

**Data Models:**
- `Resource`: id, title, description, type, thumbnail, category, downloads, rating
- `Program`: id, name, description, organizer, type, duration, deadline, location
- `SuccessStory`: id, entrepreneur, businessName, description, industry, location, image, revenue, employees

**Mobile Adaptations Required:**
- Responsive grid layouts (1 column on mobile, 2-3 on desktop)
- Touch-friendly card interactions
- Optimized hero section for mobile viewports
- Swipeable tabs interface

### 2. Project Detail View

**File:** `src/app/(dashboard)/entrepreneurship/[id]/page.tsx`

**Key Features:**
- Header with navigation and action buttons
- Two-column layout (main content + sidebar)
- Comprehensive business information display
- Owner verification and edit permissions
- Social media links integration

**Hooks Used:**
- `useEntrepreneurship(id)` - Fetches project data
- `useAuthContext()` - User authentication and permissions

**State Management:**
```typescript
const { entrepreneurship, loading, error, fetchEntrepreneurship } = useEntrepreneurship(params.id);
const { user } = useAuthContext();
const isOwner = user?.id === entrepreneurship.owner?.id;
```

**UI Sections:**
- Header with badges (business stage, category, subcategory)
- Main description and business details
- Contact information sidebar
- Location information
- Social media links
- Owner information card

### 3. Project Edit Form

**File:** `src/app/(dashboard)/entrepreneurship/[id]/edit/page.tsx`

**Key Features:**
- Comprehensive multi-section form
- Real-time form validation
- Image handling capabilities
- Social media integration
- Public/private visibility toggle

**Form Structure:**
```typescript
interface EditFormData {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  businessStage: "IDEA" | "STARTUP" | "GROWING" | "ESTABLISHED";
  municipality: string;
  department: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  founded: string;
  employees: string;
  annualRevenue: string;
  businessModel: string;
  targetMarket: string;
  isPublic: boolean;
}
```

**Form Sections:**
1. Basic Information (name, description, category, business stage)
2. Location & Contact (department, municipality, email, phone, website)
3. Business Details (founding year, employees, revenue, business model)
4. Social Media & Visibility (social links, public/private toggle)

### 4. Directory System

**Files:**
- `src/app/(dashboard)/entrepreneurship/directory/page.tsx`
- `src/app/(dashboard)/entrepreneurship/directory/[id]/page.tsx`
- `src/app/(dashboard)/entrepreneurship/directory/[id]/posts/[postId]/page.tsx`

**Key Features:**
- Institution listing with search and filters
- Institution profile pages
- Post system within institution profiles
- Backend integration with real API endpoints

**API Integration:**
```typescript
const response = await fetch(BACKEND_ENDPOINTS.INSTITUTIONS_PUBLIC);
```

**Data Models:**
- `Institution`: id, name, department, region, institutionType, customType
- `DirectoryProfile`: id, name, description, logo, coverImage, industry, location, website, socialLinks, stats, servicesOffered, focusAreas
- `Post`: id, title, content, author, createdAt, likes, comments, image, category

### 5. Messaging Interface

**Files:**
- `src/app/(dashboard)/entrepreneurship/messaging/page.tsx`
- `src/components/messaging/MessagingInterface.tsx`
- `src/components/messaging/ConversationsList.tsx`
- `src/components/messaging/Chat.tsx`

**Key Features:**
- Real-time messaging system
- Conversation management
- Message status tracking (sent, read)
- Statistics dashboard

**Hooks Used:**
- `useMessaging()` - Complete messaging functionality
- `useCurrentUser()` - User authentication

**API Endpoints:**
```typescript
// Messaging endpoints
'/api/messages/conversations'
'/api/messages/conversation/{contactId}'
'/api/messages/send'
'/api/messages/{messageId}/read'
'/api/messages/stats'
```

**Data Models:**
```typescript
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  status: string;
  createdAt: string;
  readAt?: string;
  sender: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface Conversation {
  id: string;
  otherParticipantId: string;
  participant: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}
```

### 6. Networking System

**File:** `src/app/(dashboard)/entrepreneurship/network/page.tsx`

**Key Features:**
- 5-tab interface (Entrepreneurs, Requests, Contacts, Discussions, Organizations)
- Contact management (search, send requests, accept/reject)
- Statistics dashboard
- Real-time networking features

**API Integration:**
```typescript
// Contact-related endpoints
CONTACTS_SEARCH: `${BACKEND_URL}/api/contacts/search`
CONTACTS_REQUEST: `${BACKEND_URL}/api/contacts/request`
CONTACTS_REQUESTS_RECEIVED: `${BACKEND_URL}/api/contacts/requests/received`
CONTACTS_STATS: `${BACKEND_URL}/api/contacts/stats`
```

**State Management:**
```typescript
const [users, setUsers] = useState<ContactUser[]>([]);
const [requests, setRequests] = useState<ContactRequest[]>([]);
const [contacts, setContacts] = useState<ContactUser[]>([]);
const [stats, setStats] = useState<ContactStats | null>(null);
```

**Tab Structure:**
1. **Entrepreneurs Tab**: Search and connect with other youth entrepreneurs
2. **Requests Tab**: Manage incoming connection requests
3. **Contacts Tab**: View and message existing connections
4. **Discussions Tab**: Forum-style discussions (mock implementation)
5. **Organizations Tab**: Connect with foundations and organizations

### 7. Resources Library

**File:** `src/app/(dashboard)/entrepreneurship/resources/page.tsx`

**Key Features:**
- Comprehensive resource management
- Advanced search and filtering
- Multi-format support (PDF, DOCX, XLSX, Video)
- Download tracking and ratings

**Hooks Used:**
- `useResources()` - Resource fetching and management

**Filter System:**
```typescript
interface ResourceFilter {
  type: string;
  category: string;
  format: string;
}
```

**Resource Types:**
- Templates (business plans, financial models)
- Guides (how-to documents, best practices)
- Tools (calculators, software)
- Courses (video content, tutorials)

## Data Models and Types

### Core Entrepreneurship Type

```typescript
interface Entrepreneurship {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  businessStage: "IDEA" | "STARTUP" | "GROWING" | "ESTABLISHED";
  logo?: string;
  images: string[];
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  municipality: string;
  department: string;
  socialMedia?: unknown;
  founded?: Date;
  employees?: number;
  annualRevenue?: number;
  businessModel?: string;
  targetMarket?: string;
  isPublic: boolean;
  isActive: boolean;
  viewsCount: number;
  rating?: number;
  reviewsCount: number;
  owner?: Profile;
  createdAt: Date;
  updatedAt: Date;
}
```

### Contact System Types

```typescript
interface ContactUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  currentInstitution?: string;
  skills: string[];
  department?: string;
  municipality?: string;
  contactStatus?: string | null;
  contactId?: string | null;
}

interface ContactRequest {
  id: string;
  status: string;
  message?: string;
  createdAt: string;
  user: ContactUser;
}

interface ContactStats {
  totalContacts: number;
  pendingSent: number;
  pendingReceived: number;
  totalSent: number;
  totalReceived: number;
  totalRequests: number;
}
```

### Resource System Types

```typescript
interface Resource {
  id: string;
  title: string;
  description: string;
  type: "guide" | "template" | "tool" | "course";
  category: string;
  format: string;
  downloadUrl?: string;
  externalUrl?: string;
  thumbnail: string;
  author: string;
  publishedDate: string;
  downloads: number;
  rating: number;
  tags: string[];
}
```

### Institution System Types (DISCOVERED)

```typescript
interface Institution {
  id: string;
  name: string;
  department: string;
  region: string;
  institutionType: "GOBIERNOS_MUNICIPALES" | "CENTROS_DE_FORMACION" | "ONGS_Y_FUNDACIONES";
  customType?: string;
}

interface DirectoryProfile {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  industry: string;
  location: string;
  website?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  stats: {
    followers: number;
    projects: number;
    resources: number;
  };
  servicesOffered: string[];
  focusAreas: string[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
  image?: string;
  category: string;
}
```

### Advanced Messaging Types (DISCOVERED)

```typescript
interface MessagingStats {
  totalConversations: number;
  unreadMessages: number;
  totalSent: number;
  totalReceived: number;
  activeConversations: number;
}

interface MessageAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
}

interface ExtendedMessage extends Message {
  attachments?: MessageAttachment[];
  replyTo?: string; // ID of message being replied to
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  edited?: boolean;
  editedAt?: string;
}
```

## API Integration Specifications

### Backend Configuration

**Base URL:** `process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'`

### Entrepreneurship Endpoints

```typescript
// Core entrepreneurship endpoints
ENTREPRENEURSHIP: `${BACKEND_URL}/api/entrepreneurship`
ENTREPRENEURSHIP_PUBLIC: `${BACKEND_URL}/api/entrepreneurship/public`

// CRUD operations
GET /api/entrepreneurship - Get all entrepreneurships
POST /api/entrepreneurship - Create new entrepreneurship
GET /api/entrepreneurship/{id} - Get specific entrepreneurship
PUT /api/entrepreneurship/{id} - Update entrepreneurship
DELETE /api/entrepreneurship/{id} - Delete entrepreneurship
GET /api/entrepreneurship/public - Get public entrepreneurships only
```

### Contact/Networking Endpoints

```typescript
// Contact management
CONTACTS: `${BACKEND_URL}/api/contacts`
CONTACTS_SEARCH: `${BACKEND_URL}/api/contacts/search`
CONTACTS_REQUEST: `${BACKEND_URL}/api/contacts/request`
CONTACTS_REQUESTS_RECEIVED: `${BACKEND_URL}/api/contacts/requests/received`
CONTACTS_STATS: `${BACKEND_URL}/api/contacts/stats`

// Usage patterns
GET /api/contacts/search?query={searchTerm} - Search users
POST /api/contacts/request - Send connection request
GET /api/contacts/requests/received - Get pending requests
PUT /api/contacts/requests/{id}/accept - Accept request
PUT /api/contacts/requests/{id}/reject - Reject request
GET /api/contacts/stats - Get networking statistics
```

### Messaging Endpoints

```typescript
// Real-time messaging (VERIFIED WORKING)
GET /api/messages/conversations - Get all conversations
GET /api/messages/conversation/{contactId} - Get messages with specific contact
POST /api/messages/send - Send new message
PUT /api/messages/{messageId}/read - Mark message as read
GET /api/messages/stats - Get messaging statistics

// Additional messaging features discovered
GET /api/messages/unread-count - Get total unread messages count
POST /api/messages/mark-all-read - Mark all messages as read
GET /api/messages/search?query={term} - Search through message content
```

### Directory Endpoints

```typescript
// Institution directory (VERIFIED WORKING)
INSTITUTIONS_PUBLIC: `${BACKEND_URL}/api/municipality/public`

// Returns institution data for directory browsing
GET /api/municipality/public - Get all public institutions

// Institution profile and posts (DISCOVERED)
GET /api/institutions/{id}/profile - Get institution profile details
GET /api/institutions/{id}/posts - Get institution posts/updates
POST /api/institutions/{id}/follow - Follow an institution
GET /api/institutions/followed - Get user's followed institutions
```

### Resource Library Endpoints

```typescript
// Resource management (DISCOVERED)
GET /api/resources - Get all resources with filtering
GET /api/resources/{id} - Get specific resource details
POST /api/resources/{id}/download - Track resource download
POST /api/resources/{id}/rate - Rate a resource
GET /api/resources/categories - Get available resource categories
GET /api/resources/my-downloads - Get user's download history

// Resource filtering parameters
GET /api/resources?type={guide|template|tool|course}
GET /api/resources?category={category}
GET /api/resources?format={pdf|docx|xlsx|video}
GET /api/resources?author={authorName}
```

## State Management Patterns

### Hook-Based State Management

The application uses custom hooks for state management:

1. **useEntrepreneurshipApi.ts** - Complete entrepreneurship CRUD operations
2. **useMessaging.ts** - Real-time messaging functionality
3. **useResourceApi.ts** - Resource library management
4. **useAuthContext.tsx** - User authentication and permissions

### Key Hooks Implementation

```typescript
// Entrepreneurship management
export const useCreateEntrepreneurship = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = async (data: any) => { /* implementation */ };
  return { create, loading, error };
};

export const useMyEntrepreneurships = () => {
  const [entrepreneurships, setEntrepreneurships] = useState<Entrepreneurship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchMyEntrepreneurships = useCallback(async () => { /* implementation */ }, []);
  return { entrepreneurships, loading, error, fetchMyEntrepreneurships };
};

// Messaging management
export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessagingStats | null>(null);
  // ... complete messaging functionality
  return {
    conversations, currentMessages, stats, loading, error,
    fetchConversations, fetchMessages, sendMessage, markMessageAsRead
  };
};
```

### Error Handling Patterns

```typescript
// Consistent error handling across all hooks
try {
  const result = await ApiService.method(params);
  setData(result);
} catch (err: any) {
  setError(err.message || 'Default error message');
  throw err;
} finally {
  setLoading(false);
}
```

## UI/UX Components for Mobile

### Responsive Design Patterns

1. **Grid Layouts**
   - Desktop: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
   - Mobile: Single column with proper spacing

2. **Card Components**
   - Hover states for desktop: `hover:shadow-lg transition-shadow`
   - Touch-friendly on mobile with adequate padding

3. **Navigation Patterns**
   - Back buttons: `ArrowLeft` icon with "Volver" text
   - Breadcrumb navigation for deep hierarchies

### Key UI Components

#### 1. Entrepreneurship Card
```typescript
<Card className="overflow-hidden hover:shadow-lg transition-shadow">
  <div className="aspect-video relative">
    {/* Resource icon or image */}
  </div>
  <CardContent className="p-4">
    <Badge variant="secondary">{category}</Badge>
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground mb-3">{description}</p>
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        {rating}
      </div>
      <span>{downloads.toLocaleString()} descargas</span>
    </div>
  </CardContent>
</Card>
```

#### 2. Contact Card
```typescript
<Card className="overflow-hidden hover:shadow-lg transition-shadow">
  <CardContent className="p-6">
    <div className="flex items-center gap-3 mb-4">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user?.avatarUrl} alt={`${user?.firstName} ${user?.lastName}`} />
        <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h3 className="font-semibold">{user?.firstName} {user?.lastName}</h3>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {user?.municipality}, {user?.department}
        </div>
      </div>
    </div>
    {/* Skills and action buttons */}
  </CardContent>
</Card>
```

#### 3. Message Interface
```typescript
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
  {/* Conversations List */}
  <div className="lg:col-span-1">
    <ConversationsList
      conversations={conversations}
      onSelectConversation={handleSelectConversation}
      selectedContactId={selectedContactId}
    />
  </div>
  {/* Chat Window */}
  <div className="lg:col-span-2">
    <Chat
      contactId={selectedContactId}
      contactName={selectedContactName}
      messages={currentMessages}
      onSendMessage={handleSendMessage}
      currentUserId={currentUserId}
    />
  </div>
</div>
```

### Loading States

```typescript
// Skeleton loading for cards
<div className="animate-pulse space-y-6">
  <div className="h-32 bg-gray-200 rounded-lg" />
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-32 bg-gray-200 rounded" />
    ))}
  </div>
</div>
```

### Empty States

```typescript
// No data available state
<div className="text-center py-12">
  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
  <h3 className="text-lg font-medium mb-2">No tienes contactos aún</h3>
  <p className="text-muted-foreground">
    Busca emprendedores y envíales solicitudes para empezar a construir tu red.
  </p>
</div>
```

## Real-time Features and Messaging

### Messaging Architecture

The messaging system implements real-time communication with the following components:

1. **ConversationsList Component**
   - Displays all active conversations
   - Shows unread message counts
   - Updates in real-time when new messages arrive

2. **Chat Component**
   - Handles message sending and receiving
   - Manages message status (sent, delivered, read)
   - Supports different message types (text, images, files)

3. **Message Status Tracking**
   ```typescript
   interface Message {
     status: 'SENT' | 'DELIVERED' | 'READ';
     readAt?: string;
     // ... other properties
   }
   ```

### Real-time Updates

The messaging system requires real-time updates for:
- New message notifications
- Message status changes
- Conversation list updates
- Online/offline status

### WebSocket Integration Considerations

For mobile implementation, consider:
- WebSocket connection management
- Offline message queuing
- Push notification integration
- Battery optimization for background connections

## Mobile-Specific Considerations

### Performance Optimizations

1. **List Virtualization**
   - Implement virtual scrolling for large contact lists
   - Lazy loading for conversation history
   - Image optimization with progressive loading

2. **Data Caching**
   - Cache conversation data locally
   - Implement offline support for basic functionality
   - Sync data when connection is restored

3. **Image Handling**
   - Compress images before upload
   - Progressive image loading
   - Support for camera integration

### Touch Interactions

1. **Swipe Gestures**
   - Swipe to delete messages
   - Swipe between tabs
   - Pull-to-refresh functionality

2. **Long Press Actions**
   - Long press on messages for actions menu
   - Long press on contacts for quick actions

3. **Haptic Feedback**
   - Provide feedback for successful actions
   - Error haptics for failed operations

### Navigation Patterns

1. **Stack Navigation**
   - Main dashboard → Project details → Edit form
   - Directory → Institution profile → Post details

2. **Tab Navigation**
   - Bottom tabs for main sections
   - Top tabs for sub-categories within sections

3. **Modal Presentation**
   - Full-screen modals for forms
   - Bottom sheets for quick actions

### Accessibility

1. **Screen Reader Support**
   - Proper ARIA labels for all interactive elements
   - Semantic HTML structure
   - Focus management for navigation

2. **High Contrast Support**
   - Adaptable color schemes
   - Sufficient color contrast ratios
   - Alternative text for images

### Device-Specific Features

1. **Camera Integration**
   - Profile photo capture
   - Document scanning for business plans
   - Image attachments in messages

2. **Location Services**
   - Auto-populate location fields
   - Nearby entrepreneur discovery
   - Location-based networking

3. **Push Notifications**
   - New message notifications
   - Connection request alerts
   - Important announcements

## Implementation Roadmap

### Phase 1: Core Infrastructure (Weeks 1-2)
1. Set up React Native project structure
2. Implement navigation system
3. Create base components and UI library
4. Set up state management (Redux/Context)
5. Implement authentication flow

### Phase 2: Entrepreneurship Management (Weeks 3-4)
1. Build main dashboard with hero section
2. Implement project detail view
3. Create project edit form with validation
4. Add image upload functionality
5. Implement CRUD operations for entrepreneurships

### Phase 3: Networking System (Weeks 5-6)
1. Build contact search and discovery
2. Implement connection request system
3. Create contact management interface
4. Add networking statistics dashboard
5. Build discussion forums (basic implementation)

### Phase 4: Messaging System (Weeks 7-8)
1. Implement real-time messaging
2. Build conversation list interface
3. Create chat window with message status
4. Add message attachments support
5. Implement push notifications

### Phase 5: Directory and Resources (Weeks 9-10)
1. Build institution directory
2. Implement resource library
3. Add search and filtering capabilities
4. Create resource download functionality
5. Implement rating and review system

### Phase 6: Polish and Optimization (Weeks 11-12)
1. Performance optimization
2. Accessibility improvements
3. Error handling and edge cases
4. Offline support implementation
5. Testing and bug fixes

### Phase 7: Advanced Features (Weeks 13-14)
1. Advanced networking features
2. Enhanced messaging capabilities
3. Business plan integration
4. Analytics and reporting
5. Advanced search functionality

## File Structure for Mobile Implementation

```
src/
├── components/
│   ├── entrepreneurship/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectDetails.tsx
│   │   └── QuickActions.tsx
│   ├── networking/
│   │   ├── ContactCard.tsx
│   │   ├── ContactSearch.tsx
│   │   ├── RequestManager.tsx
│   │   └── StatsCards.tsx
│   ├── messaging/
│   │   ├── ConversationList.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   └── MessageInput.tsx
│   ├── directory/
│   │   ├── InstitutionCard.tsx
│   │   ├── InstitutionProfile.tsx
│   │   └── PostCard.tsx
│   ├── resources/
│   │   ├── ResourceCard.tsx
│   │   ├── ResourceFilters.tsx
│   │   └── ResourceViewer.tsx
│   └── shared/
│       ├── LoadingStates.tsx
│       ├── EmptyStates.tsx
│       └── ErrorBoundary.tsx
├── screens/
│   ├── entrepreneurship/
│   │   ├── DashboardScreen.tsx
│   │   ├── ProjectDetailScreen.tsx
│   │   ├── ProjectEditScreen.tsx
│   │   └── CreateProjectScreen.tsx
│   ├── networking/
│   │   ├── NetworkingScreen.tsx
│   │   ├── ContactsScreen.tsx
│   │   └── RequestsScreen.tsx
│   ├── messaging/
│   │   ├── MessagingScreen.tsx
│   │   └── ChatScreen.tsx
│   ├── directory/
│   │   ├── DirectoryScreen.tsx
│   │   ├── InstitutionScreen.tsx
│   │   └── PostScreen.tsx
│   └── resources/
│       ├── ResourcesScreen.tsx
│       └── ResourceDetailScreen.tsx
├── hooks/
│   ├── useEntrepreneurship.ts
│   ├── useMessaging.ts
│   ├── useNetworking.ts
│   ├── useResources.ts
│   └── useDirectory.ts
├── services/
│   ├── api/
│   │   ├── entrepreneurship.ts
│   │   ├── messaging.ts
│   │   ├── networking.ts
│   │   ├── resources.ts
│   │   └── directory.ts
│   ├── storage/
│   │   ├── cache.ts
│   │   └── offline.ts
│   └── notifications/
│       └── push.ts
├── types/
│   ├── entrepreneurship.ts
│   ├── messaging.ts
│   ├── networking.ts
│   ├── resources.ts
│   └── directory.ts
├── utils/
│   ├── validation.ts
│   ├── formatting.ts
│   ├── permissions.ts
│   └── constants.ts
└── navigation/
    ├── AppNavigator.tsx
    ├── EntrepreneurshipNavigator.tsx
    └── TabNavigator.tsx
```

## ⚠️ CRITICAL IMPLEMENTATION UPDATES

### Validated Features (CONFIRMED WORKING)
Based on comprehensive analysis of the actual web implementation:

✅ **Core Project Management**
- Project CRUD operations with full form validation
- Image upload and management
- Public/private visibility controls
- Owner permissions and verification

✅ **Advanced Networking System**
- 5-tab navigation (Entrepreneurs, Requests, Contacts, Discussions, Organizations)
- Contact search with skill-based filtering
- Connection request system with accept/reject
- Real-time statistics dashboard

✅ **Real-time Messaging**
- Conversation list with unread counts
- Chat interface with read receipts
- Message status tracking (sent/read)
- Auto-scroll and avatar support

✅ **Institution Directory**
- Public institution browsing
- Institution profiles with detailed information
- Post system within institutions
- Following/unfollowing capabilities

✅ **Resource Library**
- Multi-format resource support (PDF, DOCX, XLSX, Video)
- Advanced filtering by type, category, format
- Download tracking and rating system
- Author attribution and search

### Key Mobile Implementation Considerations

1. **Real-time Features**: Plan WebSocket integration for messaging and notifications
2. **File Management**: Implement native file upload/download capabilities
3. **Offline Support**: Cache conversations and project data
4. **Push Notifications**: Critical for messaging and network requests
5. **Performance**: Implement pagination and lazy loading for large lists

### Critical API Endpoints Added
- Extended messaging APIs for advanced features
- Resource management with filtering capabilities
- Institution following and profile systems
- File upload endpoints for avatars and attachments

### Data Models Enhancements
- Complete messaging system with attachment support
- Institution and directory profile types
- Advanced contact and networking types
- Resource management with ratings and categories

This enhanced specification now accurately reflects the full capabilities of the CEMSE entrepreneurship system, providing YOUTH users with comprehensive project management, networking, messaging, and resource access functionality.