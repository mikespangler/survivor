# Add Yourself to the Seeded League

After running the seed script, you need to add your own user account to the league to view it.

## Quick Method

Run this command with your details:

```bash
npm run db:add-me "your.email@example.com" "Your Name"
```

Example:
```bash
npm run db:add-me "mike@example.com" "Mike"
```

## With Your Clerk ID

If you know your Clerk user ID (recommended for production), you can provide it:

```bash
npm run db:add-me "your.email@example.com" "Your Name" "user_2abc123xyz"
```

## What This Does

1. ✅ Finds or creates a user record for you
2. ✅ Adds you as a member of "Survivor Superfans League"
3. ✅ Creates a team for you in the active season
4. ✅ Allows you to view the league in the app

## Finding Your Clerk ID

If you're already logged into the app, you can find your Clerk ID by:

1. **Option 1**: Check the Clerk Dashboard
   - Go to https://dashboard.clerk.com
   - Navigate to Users
   - Find your user and copy the ID (starts with `user_`)

2. **Option 2**: Check the database
   ```bash
   npx prisma studio
   ```
   - Open the User table
   - Find your record by email
   - Copy the clerkId value

3. **Option 3**: Use a temporary ID
   - If you just want to test, the script will auto-generate a temporary Clerk ID
   - This works for development but won't match a real Clerk login

## After Adding Yourself

Once added, you can:
- View the league standings
- See all 10 teams and their scores
- Browse episode questions and results
- See the mid-season game state (8 episodes completed)

## Note About Team

Your newly created team will have:
- ✅ A team name based on your first name
- ⚠️ No castaways drafted (0 points)
- 📝 You can manually add castaways via the app draft feature

If you want your team to have castaways and points like the other teams, you'll need to either:
1. Use the draft feature in the app
2. Or manually modify the seed script to include your user from the start

## Troubleshooting

**"Could not find Survivor Superfans League"**
- Make sure you ran `npm run db:seed` first

**"You are already a member"**
- You've already been added! Just log in and view the league

**Email already exists**
- The script will use the existing user record and just add them to the league
