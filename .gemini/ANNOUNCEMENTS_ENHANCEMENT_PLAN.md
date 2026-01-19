# Announcements Enhancement Implementation Plan

## Overview
Add advanced features to the announcements system including polls, expiry, pinning, and editing.

## Features to Implement

### 1. Edit Button for Admins ⭐ (Quick Win)
**Priority**: HIGH
**Complexity**: LOW

- Add "Edit" button next to "Delete" for admins
- Create EditAnnouncementModal (similar to Create)
- API endpoint: PUT `/api/announcements/[id]`
- Allow editing: title, content, image, commentsEnabled

### 2. Polls Feature ⭐⭐⭐ (Major Feature)
**Priority**: HIGH
**Complexity**: HIGH

**Database Schema Changes**:
```prisma
model Poll {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  question    String
  description String?
  options     PollOption[]
  isAnonymous Boolean  @default(false)
  endsAt      DateTime?
  createdById String   @db.ObjectId
  createdBy   User     @relation(fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Link to announcement (optional - can be standalone or part of announcement)
  announcementId String? @db.ObjectId
  announcement   Announcement? @relation(fields: [announcementId], references: [id])
  
  isPinned    Boolean  @default(false)
  
  @@map("polls")
}

model PollOption {
  id      String     @id @default(auto()) @map("_id") @db.ObjectId
  text    String
  pollId  String     @db.ObjectId
  poll    Poll       @relation(fields: [pollId], references: [id], onDelete: Cascade)
  votes   PollVote[]
  
  @@map("poll_options")
}

model PollVote {
  id        String     @id @default(auto()) @map("_id") @db.ObjectId
  optionId  String     @db.ObjectId
  option    PollOption @relation(fields: [optionId], references: [id], onDelete: Cascade)
  userId    String     @db.ObjectId
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime   @default(now())
  
  @@unique([optionId, userId])
  @@map("poll_votes")
}
```

**Components**:
- `CreatePollModal.tsx` - Create/Edit polls
- `PollCard.tsx` - Display poll with voting
- `PollResultsModal.tsx` - Show detailed results

**API Endpoints**:
- `POST /api/polls` - Create poll
- `PUT /api/polls/[id]` - Edit poll
- `DELETE /api/polls/[id]` - Delete poll
- `POST /api/polls/[id]/vote` - Vote on poll
- `GET /api/polls/[id]/results` - Get results

**Features**:
- Question + Description
- 2+ options
- Anonymous/Open voting
- Optional end date
- Real-time vote updates (Pusher)
- Can be pinned

### 3. Announcement Expiry ⭐ (Medium)
**Priority**: MEDIUM
**Complexity**: MEDIUM

**Database Schema Changes**:
```prisma
model Announcement {
  // ... existing fields
  expiresAt DateTime?
  isPinned  Boolean  @default(false)
}
```

**Implementation**:
- Add `expiresAt` field to Announcement model
- Add date picker in CreateAnnouncementModal
- Create cron job or scheduled task to delete expired announcements
- Option 1: Next.js API route with cron trigger
- Option 2: Database trigger (if MongoDB supports)
- Option 3: Check on fetch and filter out expired

**Recommended**: Check on fetch (simplest)

### 4. Pin Posts to Top ⭐ (Easy)
**Priority**: MEDIUM
**Complexity**: LOW

**Database Schema Changes**:
- Add `isPinned` boolean to Announcement model
- Add `pinnedAt` DateTime for ordering

**Implementation**:
- Add "Pin" button for admins
- API endpoint: PATCH `/api/announcements/[id]/pin`
- Update feed query to sort: `isPinned DESC, createdAt DESC`
- Visual indicator (pin icon) on pinned posts

### 5. Anonymous vs Open Polls ⭐⭐ (Medium)
**Priority**: MEDIUM
**Complexity**: MEDIUM

**Anonymous Poll**:
- Voters are not revealed
- Only vote counts shown
- No "who voted" list

**Open Poll**:
- Show who voted for what
- Display voter names/avatars
- Admin can see all votes

**Implementation**:
- `isAnonymous` boolean on Poll
- Conditional rendering in PollResultsModal
- If anonymous: Show only counts
- If open: Show voter list per option

## Implementation Order

### Phase 1: Quick Wins (1-2 days)
1. ✅ Edit button for admins
2. ✅ Pin posts feature
3. ✅ Expiry date (basic - check on fetch)

### Phase 2: Polls Foundation (2-3 days)
1. Database schema updates
2. Create Poll API endpoints
3. CreatePollModal component
4. Basic PollCard display

### Phase 3: Polls Advanced (2-3 days)
1. Voting functionality
2. Real-time updates
3. Anonymous vs Open
4. PollResultsModal
5. Integration with announcements

### Phase 4: Polish (1 day)
1. Auto-delete expired announcements (cron)
2. Pin polls separately
3. Testing and bug fixes

## Technical Considerations

### Database Migrations
- Need to update Prisma schema
- Run `npx prisma db push` or create migration
- Existing data won't have new fields (defaults will apply)

### Real-time Updates
- Use Pusher for live poll results
- Channel: `poll-${pollId}`
- Events: `vote-added`, `poll-ended`

### Permissions
- Only admins can create/edit/delete polls
- All users can vote (if not expired)
- One vote per user per poll

### UI/UX
- Polls can be standalone or part of announcement
- Visual distinction between announcement and poll
- Progress bars for vote percentages
- Disable voting after poll ends

## Files to Create/Modify

### New Files
- `src/components/polls/CreatePollModal.tsx`
- `src/components/polls/PollCard.tsx`
- `src/components/polls/PollResultsModal.tsx`
- `src/app/api/polls/route.ts`
- `src/app/api/polls/[id]/route.ts`
- `src/app/api/polls/[id]/vote/route.ts`
- `src/app/api/polls/[id]/results/route.ts`

### Modified Files
- `prisma/schema.prisma`
- `src/components/announcements/PostCard.tsx` (add edit button)
- `src/components/announcements/CreateAnnouncementModal.tsx` (add expiry, poll option)
- `src/components/announcements/AnnouncementFeed.tsx` (pinned sorting)
- `src/app/api/announcements/route.ts` (filter expired)
- `src/app/api/announcements/[id]/route.ts` (edit endpoint)

## Next Steps

1. Review and approve this plan
2. Update Prisma schema
3. Start with Phase 1 (quick wins)
4. Iterate through phases

Would you like me to start with Phase 1 (Edit button + Pin feature)?
