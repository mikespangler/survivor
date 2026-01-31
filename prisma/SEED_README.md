# Mid-Season Seed Data

This seed file creates a realistic mid-season state for testing and development.

## What Gets Created

### Season
- **Season 48: Island of Secrets**
- Status: ACTIVE
- Current Episode: 8 (mid-season)
- Start Date: September 18, 2024

### Castaways (18 total)
- **10 Active** - Still in the game
- **4 Jury Members** - Voted out post-merge
- **4 Eliminated** - Voted out pre-merge

Castaways include:
- Marcus Chen
- Sarah Thompson
- Devon Williams
- Aisha Patel
- Jake Morrison (Jury)
- Olivia Rodriguez
- Tyler Jackson (Eliminated - Episode 3)
- Emma Martinez
- Carlos Santos
- Maya Anderson
- Ryan Cooper (Jury - Episode 8)
- Jasmine Lee
- Brandon Taylor (Eliminated - Episode 1)
- Nina Foster (Eliminated - Episode 2)
- Alex Turner (Jury - Episode 6)
- Rachel Green (Jury - Episode 5)
- Jordan Hayes (Eliminated - Episode 4)
- Sophia Clark

### Episodes
8 episodes created with:
- Realistic air dates (weekly, starting Sept 18, 2024)
- Episode 1: "Premiere"
- Episode 5: "The Merge"

### League
- **Survivor Superfans League**
- Commissioner: Commissioner Mike (admin)
- 10 active teams/players

### Teams (10 total)
Each team has:
- An owner (unique user)
- A creative team name
- 3 drafted castaways (mix of active, jury, and eliminated)
- Points from 8 episodes of questions and retention

Team names include:
- Island Warriors
- Torch Bearers
- Jury Dodgers
- Merge Masters
- Vote Blockers
- And 5 more...

### Questions (8 episodes worth)
Each episode has 3-4 questions including:
- **Multiple Choice** questions (e.g., "Who will win immunity?")
- **Fill in the Blank** questions (e.g., "Who gets voted out?")
- **Wager questions** with varying min/max wager amounts
- Mix of easy and hard questions
- All questions have been scored with correct answers

Question categories include:
- Immunity winners
- Elimination predictions
- Idol/advantage tracking
- Strategic gameplay
- Merge dynamics

### Answers
- All 10 teams have answered all questions for episodes 1-8
- Varied answer patterns (some teams doing well, others struggling)
- Realistic score distribution
- Wager amounts included for wager questions

### Scoring System
- **Question Points**: Earned by correct answers
- **Retention Points**: 2 points per active castaway per episode
- **Episode Points**: Tracked for each episode
- **Running Total**: Cumulative scores maintained

## How to Run

### Option 1: Using npm script (recommended)
```bash
npm run db:seed
```

### Option 2: Direct execution
```bash
npx ts-node prisma/seed-midseason.ts
```

### Reset and Seed
To completely reset the database and seed fresh data:
```bash
npm run db:reset
npm run db:seed
```

## Test Credentials

### Commissioner (Admin)
- Email: commissioner@example.com
- Name: Commissioner Mike
- Role: Admin (can manage questions, scores, etc.)

### Team Owners (Players)
1. Alex Johnson - alex.johnson@example.com
2. Jordan Smith - jordan.smith@example.com
3. Taylor Brown - taylor.brown@example.com
4. Morgan Davis - morgan.davis@example.com
5. Casey Wilson - casey.wilson@example.com
6. Riley Martinez - riley.martinez@example.com
7. Jamie Anderson - jamie.anderson@example.com
8. Parker Thomas - parker.thomas@example.com
9. Quinn Garcia - quinn.garcia@example.com
10. Cameron Lee - cameron.lee@example.com

## What to Test

With this seed data, you can test:
- ✅ Viewing league standings with realistic scores
- ✅ Team rosters with mix of active/eliminated castaways
- ✅ Episode results showing who got questions right/wrong
- ✅ Wager question scoring (positive and negative points)
- ✅ Retention points calculation
- ✅ Episode-by-episode point tracking
- ✅ Mid-season merge dynamics
- ✅ Jury member tracking
- ✅ Historical question answers
- ✅ Commissioner admin functions

## Notes

- The seed script **clears existing data** before seeding
- Comment out the cleanup section if you want to preserve existing data
- Clerk IDs are auto-generated with timestamps
- All times use EDT timezone (America/New_York)
- Points are already calculated and teams have varied standings
