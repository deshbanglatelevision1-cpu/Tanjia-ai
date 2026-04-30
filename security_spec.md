# Security Specification - TANJIA AI Cinema

## 1. Data Invariants
- Users can only modify their own profiles.
- Videos are immutable once uploaded (except for stats/views which are updated by the system/Cloud Functions).
- Messages can only be read/written by participants in the chat (chatId usually derived from `min(uid1, uid2)_max(uid1, uid2)`).
- Comments can only be deleted/edited by the author.

## 2. Dirty Dozen Payloads (Targeting Rejection)

| Payload ID | Target Action | Vulnerability Targeted | Payload Snippet | Expected Result |
|------------|---------------|------------------------|-----------------|-----------------|
| P1 | Create User Profile | Identity Spoofing | `{ "uid": "victim_uid", "email": "me@hacker.com" }` | PERMISSION_DENIED |
| P2 | Update User Stats | Privilege Escalation | `{ "affectedKeys": ["role"] }` | PERMISSION_DENIED |
| P3 | Read Video Comments | Orphaned Access | Reading comments of a deleted video | PERMISSION_DENIED |
| P4 | List Private Chats | Data Scraping | `allow list: if isSignedIn()` without `resource.data` check | PERMISSION_DENIED |
| P5 | Create Message | ID Poisoning | Message with 2KB junk document ID | PERMISSION_DENIED |
| P6 | Update Message | Mutation Gap | Changing `senderId` of an existing message | PERMISSION_DENIED |
| P7 | Delete Video | Authorization Bypass | User A deleting User B's video | PERMISSION_DENIED |
| P8 | Create User | Schema Pollution | Adding `isAdmin: true` during registration | PERMISSION_DENIED |
| P9 | Create Chat | Size Abuse | Chat document with 10,000 participant IDs in array | PERMISSION_DENIED |
| P10 | Write Comment | Temporal Forgery | Sending `timestamp` from client instead of `request.time` | PERMISSION_DENIED |
| P11 | Update Comment | Key Injection | Updating `text` and `likes` simultaneously | PERMISSION_DENIED |
| P12 | Read PII | Privacy Leak | Authenticated user reading User B's email | PERMISSION_DENIED |

## 3. Test Runner
A `firestore.rules.test.ts` will be implemented to verify these constraints.
