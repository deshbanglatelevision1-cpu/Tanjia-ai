# TANJIA AI Cinema - Technical Architecture Definition

## 1. Executive Summary
TANJIA AI Cinema is a hybrid media and social integration platform designed to bridge the gap between short-form engagement and long-form cinematic experiences. Powered by Flutter for the frontend and Firebase for the backend, it utilizes AI to enhance content discovery and interaction.

---

## 2. Technical Stack
- **Frontend Framework:** Flutter (Dart)
- **Backend-as-a-Service:** Google Firebase
  - **Authentication:** Firebase Auth (Google Sign-In SSO)
  - **Database:** Cloud Firestore (Scalable NoSQL)
  - **Storage:** Google Cloud Storage (Large asset hosting)
- **Video Engine/CDN:** 
  - Host: GCS / AWS S3
  - Delivery: Google Cloud CDN / CloudFront
- **AI Integration:** Google Gemini API (via serverless functions or direct SDK integration)

---

## 3. High-Level Directory Structure (Flutter)
```text
lib/
├── core/
│   ├── constants/             # API Keys, Colors, UI constants
│   ├── theme/                 # Neon-Dark theme definition (ThemeData)
│   └── utils/                 # Helpers (date formatting, video preloading)
├── data/
│   ├── models/                # User, Video, Message, Comment entities
│   ├── repositories/          # Abstract data interfaces
│   └── datasources/           # Firebase implementation of repositories
├── domain/
│   └── usecases/              # Business logic (e.g., GetPersonalizedFeed)
├── presentation/
│   ├── providers/             # State Management (Bloc, Riverpod, or Provider)
│   ├── screens/
│   │   ├── auth/              # Google Login Screen
│   │   ├── cinema/            # Vertical (Shorts) & Horizontal (Long-form) views
│   │   ├── inbox/             # Chat lists & Private Messaging
│   │   └── profile/           # User dashboard with "Message" button
│   └── widgets/
│       ├── video_player/      # Custom Hybrid Player (Full-screen & Windowed)
│       ├── ai_assistant/      # Floating AI Bubble & BottomSheet UI
│       └── social_actions/    # Like/Dislike/Share/Subscribe buttons
└── main.dart                  # App Entry Point
```

---

## 4. Database Schema (Firestore)

### **Collections**

#### `users/` (DocumentID: Firebase UID)
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "photoURL": "string",
  "subscribedTo": ["string"], // Array of channel IDs
  "watchHistory": ["string"],  // Array of Video IDs
  "preferences": {
    "genres": ["Scifi", "Tech", "Action"],
    "lastAIPrompt": "timestamp"
  }
}
```

#### `videos/` (DocumentID: Video ID)
```json
{
  "id": "string",
  "creatorId": "string",
  "videoUrl": "string",
  "thumbnailUrl": "string",
  "type": "short" | "long",
  "resolution": "4K" | "1080p",
  "metadata": {
    "title": "Cosmic Voyage",
    "description": "Exploration of the deep nebula.",
    "tags": ["space", "ai", "cosmos"]
  },
  "metrics": {
    "views": 1500,
    "likes": 200,
    "dislikes": 5
  },
  "uploadedAt": "timestamp"
}
```

#### `messages/` (Root Collection or Subcollection)
*Path: `messages/{chatId}/thread/{msgId}`* (Where chatId = sorted_uids_concat)
```json
{
  "senderId": "string",
  "content": "string",
  "timestamp": "timestamp",
  "isRead": false
}
```

#### `comments/` (Subcollection of Video)
*Path: `videos/{videoId}/comments/{commentId}`*
```json
{
  "userId": "string",
  "text": "string",
  "timestamp": "timestamp",
  "likes": 0
}
```

---

## 5. Feature Implementation & User Flows

### **Hybrid Video Engine**
- **Shorts Feed:** Use `PageView.builder` with `scrollDirection: Axis.vertical`. 
- **Long-Form:** Use `video_player` package with adaptive orientation logic. When rotating device, enter persistent full-screen mode with custom controls.
- **Preloading:** Implement a rolling buffer that pre-fetches the next 2 videos in the user's feed to ensure sub-100ms switch times.

### **Inbox & Messaging**
- Real-time listeners via `snapshots()` on Firestore collection.
- "Message" button on User Profile triggers navigation to a ChatRoom initialized with the specific Participant UIDs.

### **Meta AI Assistant**
- **Trigger:** Overlay widget (`OverlayEntry`) for the floating bubble.
- **Context:** The assistant receives the current `videoId` metadata as a "Context Parcel" to provide relevant summaries or answers.
- **Logic:** Calls `gemini-pro` endpoint with a system prompt: *"You are the TANJIA Cinema Assistant. Analyze the following video metadata and assist the user..."*

### **Recommendation Logic**
- **Personalization:** Basic version uses tag-matching between `user.preferences.genres` and `video.metadata.tags`.
- **Advanced:** Deploy a simple Cloud Function that runs on `onWrite` for `watchHistory`, updating user preference vectors for K-Nearest Neighbors matching.

---

## 6. UI/UX Style Guide
- **Visual Palette:**
  - Background: `#000000` (Pure Black for OLED)
  - Primary Accent: `Electric Blue (#00E5FF)`
  - Secondary Accent: `Deep Pink (#FF007F)`
  - Highlight: `Violet Gradient (#8A2BE2 -> #00E5FF)`
- **Interactions:** Use `framer_motion` style transitions (via Flutter's `AnimatedContainer` and `Hero` widgets) for smooth context shifts between Home and Cinema views.
