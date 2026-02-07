import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Castaway names for Season 48
const castawayNames = [
  'Marcus Chen',
  'Sarah Thompson',
  'Devon Williams',
  'Aisha Patel',
  'Jake Morrison',
  'Olivia Rodriguez',
  'Tyler Jackson',
  'Emma Martinez',
  'Carlos Santos',
  'Maya Anderson',
  'Ryan Cooper',
  'Jasmine Lee',
  'Brandon Taylor',
  'Nina Foster',
  'Alex Turner',
  'Rachel Green',
  'Jordan Hayes',
  'Sophia Clark',
];

// Team names
const teamNames = [
  'Island Warriors',
  'Torch Bearers',
  'Jury Dodgers',
  'Merge Masters',
  'Vote Blockers',
  'Idol Hunters',
  'Fire Makers',
  'Puzzle Pros',
  'Challenge Beasts',
  'Social Strategists',
  'Blindside Brigade',
  'Tribal Titans',
  'Alliance Aces',
  'Immunity Icons',
  'Outwit Outlast',
  'Final Four',
  'Hidden Idols',
  'Reward Winners',
  'Camp Crushers',
  'Buff Collectors',
  'Ponderosa Pals',
  'Advantage Seekers',
  'Coconut Crew',
  'Bamboo Builders',
  'Flame Keepers',
  'Raft Riders',
  'Sand Sharks',
  'Jungle Cats',
  'Reef Raiders',
  'Storm Survivors',
];

// User data for team owners
const users = [
  { name: 'Alex Johnson', email: 'alex.johnson@example.com' },
  { name: 'Jordan Smith', email: 'jordan.smith@example.com' },
  { name: 'Taylor Brown', email: 'taylor.brown@example.com' },
  { name: 'Morgan Davis', email: 'morgan.davis@example.com' },
  { name: 'Casey Wilson', email: 'casey.wilson@example.com' },
  { name: 'Riley Martinez', email: 'riley.martinez@example.com' },
  { name: 'Jamie Anderson', email: 'jamie.anderson@example.com' },
  { name: 'Parker Thomas', email: 'parker.thomas@example.com' },
  { name: 'Quinn Garcia', email: 'quinn.garcia@example.com' },
  { name: 'Cameron Lee', email: 'cameron.lee@example.com' },
  { name: 'Drew Mitchell', email: 'drew.mitchell@example.com' },
  { name: 'Avery White', email: 'avery.white@example.com' },
  { name: 'Blake Harris', email: 'blake.harris@example.com' },
  { name: 'Charlie Martin', email: 'charlie.martin@example.com' },
  { name: 'Dakota Young', email: 'dakota.young@example.com' },
  { name: 'Elliott King', email: 'elliott.king@example.com' },
  { name: 'Finley Scott', email: 'finley.scott@example.com' },
  { name: 'Harley Adams', email: 'harley.adams@example.com' },
  { name: 'Jayden Baker', email: 'jayden.baker@example.com' },
  { name: 'Kendall Nelson', email: 'kendall.nelson@example.com' },
  { name: 'Logan Carter', email: 'logan.carter@example.com' },
  { name: 'Micah Evans', email: 'micah.evans@example.com' },
  { name: 'Noel Turner', email: 'noel.turner@example.com' },
  { name: 'Peyton Hall', email: 'peyton.hall@example.com' },
  { name: 'Reese Allen', email: 'reese.allen@example.com' },
  { name: 'Sage Wright', email: 'sage.wright@example.com' },
  { name: 'Skyler Lopez', email: 'skyler.lopez@example.com' },
  { name: 'Tatum Hill', email: 'tatum.hill@example.com' },
  { name: 'Wren Morgan', email: 'wren.morgan@example.com' },
  { name: 'Zion Campbell', email: 'zion.campbell@example.com' },
];

// Commissioner
const commissioner = {
  name: 'Commissioner Mike',
  email: 'commissioner@example.com',
};

// Mike Spangler - league member
const mikeSpangler = {
  name: 'Mike Spangler',
  email: 'spangler.mike@gmail.com',
};

// Question sets for each episode
const episodeQuestions = [
  // Episode 1
  [
    {
      text: 'Who will win the first immunity challenge?',
      type: 'MULTIPLE_CHOICE',
      options: ['Marcus Chen', 'Sarah Thompson', 'Devon Williams', 'Aisha Patel'],
      correctAnswer: 'Marcus Chen',
      pointValue: 5,
    },
    {
      text: 'Who will be the first person voted out?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Brandon Taylor',
      pointValue: 10,
    },
    {
      text: 'Will an immunity idol be found in Episode 1?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
      pointValue: 5,
    },
  ],
  // Episode 2
  [
    {
      text: 'Which tribe will go to Tribal Council?',
      type: 'MULTIPLE_CHOICE',
      options: ['Gata', 'Tuku', 'Neither (reward challenge)'],
      correctAnswer: 'Tuku',
      pointValue: 5,
    },
    {
      text: 'Who will be voted out second?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Nina Foster',
      pointValue: 10,
    },
    {
      text: 'How many advantages will be in play this episode?',
      type: 'MULTIPLE_CHOICE',
      options: ['0', '1', '2', '3 or more'],
      correctAnswer: '2',
      pointValue: 5,
      isWager: true,
      minWager: 1,
      maxWager: 10,
    },
  ],
  // Episode 3
  [
    {
      text: 'Who will find a hidden immunity idol?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Sarah Thompson',
      pointValue: 10,
    },
    {
      text: 'Who gets voted out?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Tyler Jackson',
      pointValue: 10,
    },
    {
      text: 'Will someone play an advantage at Tribal Council?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'No',
      pointValue: 5,
    },
  ],
  // Episode 4
  [
    {
      text: 'Will the tribes merge this episode?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'No',
      pointValue: 5,
    },
    {
      text: 'Who will be voted out fourth?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Jordan Hayes',
      pointValue: 10,
    },
    {
      text: 'How many people will receive votes at Tribal?',
      type: 'MULTIPLE_CHOICE',
      options: ['1-2', '3-4', '5 or more'],
      correctAnswer: '3-4',
      pointValue: 5,
      isWager: true,
      minWager: 1,
      maxWager: 15,
    },
  ],
  // Episode 5 - Merge
  [
    {
      text: 'What will the merge tribe name be?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Koro',
      pointValue: 5,
    },
    {
      text: 'Who wins individual immunity at the merge?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Aisha Patel',
      pointValue: 10,
    },
    {
      text: 'Who is the first member of the jury?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Rachel Green',
      pointValue: 10,
    },
    {
      text: 'Will an idol be played at the merge vote?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
      pointValue: 5,
    },
  ],
  // Episode 6
  [
    {
      text: 'Who wins immunity?',
      type: 'MULTIPLE_CHOICE',
      options: ['Marcus Chen', 'Devon Williams', 'Sarah Thompson', 'Aisha Patel'],
      correctAnswer: 'Devon Williams',
      pointValue: 5,
    },
    {
      text: 'Who joins the jury?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Alex Turner',
      pointValue: 10,
    },
    {
      text: 'Will the hidden immunity idol be found this episode?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
      pointValue: 5,
      isWager: true,
      minWager: 1,
      maxWager: 20,
    },
  ],
  // Episode 7
  [
    {
      text: 'Who will win the reward challenge?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Carlos Santos',
      pointValue: 5,
    },
    {
      text: 'Who wins immunity?',
      type: 'MULTIPLE_CHOICE',
      options: ['Marcus Chen', 'Sarah Thompson', 'Carlos Santos', 'Maya Anderson'],
      correctAnswer: 'Maya Anderson',
      pointValue: 5,
    },
    {
      text: 'Who is voted out?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Jake Morrison',
      pointValue: 10,
    },
    {
      text: 'Will this be a blindside?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
      pointValue: 5,
    },
  ],
  // Episode 8
  [
    {
      text: 'Who wins immunity?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Sophia Clark',
      pointValue: 5,
    },
    {
      text: 'Will a twist be introduced this episode?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
      pointValue: 5,
    },
    {
      text: 'Who gets voted out?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Ryan Cooper',
      pointValue: 10,
      isWager: true,
      minWager: 1,
      maxWager: 25,
    },
  ],
  // Episode 9
  [
    {
      text: 'Who wins the reward challenge?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Marcus Chen',
      pointValue: 5,
    },
    {
      text: 'Who wins immunity?',
      type: 'MULTIPLE_CHOICE',
      options: ['Marcus Chen', 'Sarah Thompson', 'Devon Williams', 'Sophia Clark'],
      correctAnswer: 'Sarah Thompson',
      pointValue: 5,
    },
    {
      text: 'Who is voted out?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Emma Martinez',
      pointValue: 10,
    },
    {
      text: 'Will an idol be played at Tribal Council?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'No',
      pointValue: 5,
      isWager: true,
      minWager: 1,
      maxWager: 20,
    },
  ],
  // Episode 10
  [
    {
      text: 'Who wins the final immunity challenge?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Devon Williams',
      pointValue: 10,
    },
    {
      text: 'Will there be a fire-making challenge?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
      pointValue: 5,
    },
    {
      text: 'Who wins the fire-making challenge?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Aisha Patel',
      pointValue: 10,
    },
    {
      text: 'Who is the Sole Survivor?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Marcus Chen',
      pointValue: 25,
      isWager: true,
      minWager: 5,
      maxWager: 50,
    },
  ],
];

async function main() {
  console.log('🌴 Starting mid-season seed...');

  // Clean up existing data (optional - comment out if you want to keep existing data)
  console.log('🧹 Cleaning up existing data...');
  await prisma.playerAnswer.deleteMany();
  await prisma.teamEpisodePoints.deleteMany();
  await prisma.leagueQuestion.deleteMany();
  await prisma.teamCastaway.deleteMany();
  await prisma.team.deleteMany();
  await prisma.retentionConfig.deleteMany();
  await prisma.leagueSeasonSettings.deleteMany();
  await prisma.draftConfig.deleteMany();
  await prisma.leagueSeason.deleteMany();
  await prisma.inviteToken.deleteMany();
  await prisma.league.deleteMany();
  await prisma.episode.deleteMany();
  await prisma.castaway.deleteMany();
  await prisma.season.deleteMany();
  await prisma.questionTemplate.deleteMany();
  await prisma.user.deleteMany();

  // Create season
  console.log('📺 Creating Season 48...');
  const season = await prisma.season.create({
    data: {
      number: 48,
      name: 'Island of Secrets',
      status: 'ACTIVE',
      startDate: new Date('2024-09-18'),
      activeEpisode: 10,
    },
  });

  // Create castaways with varying statuses (realistic mid-season)
  console.log('👥 Creating 18 castaways...');
  const castaways = [];
  for (let i = 0; i < castawayNames.length; i++) {
    let status = 'ACTIVE';

    // First 8 voted out are eliminated or jury
    if (i === 12) status = 'ELIMINATED'; // Brandon - Episode 1
    if (i === 13) status = 'ELIMINATED'; // Nina - Episode 2
    if (i === 6) status = 'ELIMINATED'; // Tyler - Episode 3
    if (i === 16) status = 'ELIMINATED'; // Jordan - Episode 4
    if (i === 15) status = 'JURY'; // Rachel - Episode 5 (merge jury)
    if (i === 14) status = 'JURY'; // Alex - Episode 6
    if (i === 4) status = 'JURY'; // Jake - Episode 7
    if (i === 10) status = 'JURY'; // Ryan - Episode 8

    const castaway = await prisma.castaway.create({
      data: {
        name: castawayNames[i],
        seasonId: season.id,
        status,
      },
    });
    castaways.push(castaway);
  }

  // Create 10 episodes
  console.log('📅 Creating 10 episodes...');
  const episodes = [];
  const baseDate = new Date('2024-09-18T20:00:00-04:00');
  for (let i = 1; i <= 10; i++) {
    const episodeDate = new Date(baseDate);
    episodeDate.setDate(baseDate.getDate() + (i - 1) * 7); // Weekly episodes

    const episode = await prisma.episode.create({
      data: {
        seasonId: season.id,
        number: i,
        airDate: episodeDate,
        title: i === 1 ? 'Premiere' : i === 5 ? 'The Merge' : undefined,
      },
    });
    episodes.push(episode);
  }

  // Create commissioner user
  console.log('👤 Creating commissioner...');
  const commissionerUser = await prisma.user.create({
    data: {
      clerkId: `clerk_commissioner_${Date.now()}`,
      email: commissioner.email,
      name: commissioner.name,
      systemRole: 'admin',
    },
  });

  // Create Mike Spangler user
  console.log('👤 Creating Mike Spangler...');
  const mikeSpanglerUser = await prisma.user.create({
    data: {
      clerkId: `clerk_mike_spangler_${Date.now()}`,
      email: mikeSpangler.email,
      name: mikeSpangler.name,
      systemRole: 'user',
    },
  });

  // Create league
  console.log('🏆 Creating league...');
  const league = await prisma.league.create({
    data: {
      name: 'Survivor Superfans League',
      description: 'A competitive league for die-hard Survivor fans',
      ownerId: commissionerUser.id,
    },
  });

  // Create league season
  console.log('🔗 Creating league season...');
  const leagueSeason = await prisma.leagueSeason.create({
    data: {
      leagueId: league.id,
      seasonId: season.id,
    },
  });

  // Create settings
  await prisma.leagueSeasonSettings.create({
    data: {
      leagueSeasonId: leagueSeason.id,
      settings: {
        retentionEnabled: true,
        defaultPointsPerCastaway: 2,
      },
    },
  });

  // Create draft config
  await prisma.draftConfig.create({
    data: {
      leagueSeasonId: leagueSeason.id,
      roundNumber: 1,
      castawaysPerTeam: 3,
      status: 'COMPLETED',
      draftDate: new Date('2024-09-15'),
    },
  });

  // Create 30 users and their teams
  console.log('👥 Creating 30 teams with owners...');
  const teams = [];
  for (let i = 0; i < 30; i++) {
    const user = await prisma.user.create({
      data: {
        clerkId: `clerk_user_${i}_${Date.now()}`,
        email: users[i].email,
        name: users[i].name,
        systemRole: 'user',
      },
    });

    const team = await prisma.team.create({
      data: {
        name: teamNames[i],
        leagueSeasonId: leagueSeason.id,
        ownerId: user.id,
        totalPoints: 0, // Will be calculated
      },
    });
    teams.push({ team, user });
  }

  // Create a team for Mike Spangler
  console.log('🏆 Creating team for Mike Spangler...');
  const mikeTeam = await prisma.team.create({
    data: {
      name: 'Tribal Council',
      leagueSeasonId: leagueSeason.id,
      ownerId: mikeSpanglerUser.id,
      totalPoints: 0,
    },
  });
  teams.push({ team: mikeTeam, user: mikeSpanglerUser });

  // Add commissioner and Mike Spangler to league members
  await prisma.league.update({
    where: { id: league.id },
    data: {
      members: {
        connect: [
          { id: commissionerUser.id },
          { id: mikeSpanglerUser.id },
          ...teams.map(t => ({ id: t.user.id })),
        ],
      },
    },
  });

  // Draft castaways to teams (3 per team, with realistic distribution)
  console.log('🎯 Drafting castaways to teams...');
  const activeCastaways = castaways.filter(c => c.status === 'ACTIVE');
  const juryCastaways = castaways.filter(c => c.status === 'JURY');
  const eliminatedCastaways = castaways.filter(c => c.status === 'ELIMINATED');

  for (let i = 0; i < teams.length; i++) {
    const { team } = teams[i];

    // Each team gets 3 castaways with varied status
    const teamCastaways = [];

    // Give each team 2 active castaways
    if (activeCastaways.length > 0) {
      teamCastaways.push(activeCastaways.shift()!);
    }
    if (activeCastaways.length > 0) {
      teamCastaways.push(activeCastaways.shift()!);
    }

    // Third castaway might be jury, eliminated, or active
    if (i < juryCastaways.length) {
      teamCastaways.push(juryCastaways[i]);
    } else if (i - juryCastaways.length < eliminatedCastaways.length) {
      teamCastaways.push(eliminatedCastaways[i - juryCastaways.length]);
    } else if (activeCastaways.length > 0) {
      teamCastaways.push(activeCastaways.shift()!);
    }

    for (const castaway of teamCastaways) {
      let endEpisode = null;

      // Determine when they were eliminated
      if (castaway.name === 'Brandon Taylor') endEpisode = 1;
      if (castaway.name === 'Nina Foster') endEpisode = 2;
      if (castaway.name === 'Tyler Jackson') endEpisode = 3;
      if (castaway.name === 'Jordan Hayes') endEpisode = 4;
      if (castaway.name === 'Rachel Green') endEpisode = 5;
      if (castaway.name === 'Alex Turner') endEpisode = 6;
      if (castaway.name === 'Jake Morrison') endEpisode = 7;
      if (castaway.name === 'Ryan Cooper') endEpisode = 8;

      await prisma.teamCastaway.create({
        data: {
          teamId: team.id,
          castawayId: castaway.id,
          startEpisode: 1,
          endEpisode,
        },
      });
    }
  }

  // Create retention configs for episodes 1-10
  console.log('💰 Creating retention configs...');
  for (let ep = 1; ep <= 10; ep++) {
    await prisma.retentionConfig.create({
      data: {
        leagueSeasonId: leagueSeason.id,
        episodeNumber: ep,
        pointsPerCastaway: 2,
      },
    });
  }

  // Create questions for all 10 episodes
  console.log('❓ Creating questions for episodes 1-10...');
  for (let ep = 1; ep <= 10; ep++) {
    const questions = episodeQuestions[ep - 1];

    for (let q = 0; q < questions.length; q++) {
      const questionData = questions[q];
      await prisma.leagueQuestion.create({
        data: {
          leagueSeasonId: leagueSeason.id,
          episodeNumber: ep,
          text: questionData.text,
          type: questionData.type,
          options: questionData.options || null,
          pointValue: questionData.pointValue,
          correctAnswer: questionData.correctAnswer,
          isScored: true,
          sortOrder: q,
          questionScope: 'episode',
          isWager: questionData.isWager || false,
          minWager: questionData.minWager || null,
          maxWager: questionData.maxWager || null,
        },
      });
    }
  }

  // Create answers for all teams for episodes 1-8
  console.log('✍️  Creating player answers...');
  const allQuestions = await prisma.leagueQuestion.findMany({
    where: { leagueSeasonId: leagueSeason.id },
    orderBy: [{ episodeNumber: 'asc' }, { sortOrder: 'asc' }],
  });

  // Answer patterns to create variety
  const answerPatterns = [
    // Pattern for each team (some right, some wrong)
    [1, 1, 1], // Team 0: all correct on ep1
    [1, 0, 1], // Team 1: mostly correct
    [0, 1, 1], // Team 2: mostly correct
    [1, 1, 0], // Team 3: mostly correct
    [0, 0, 1], // Team 4: some correct
    [1, 0, 0], // Team 5: some correct
    [0, 1, 0], // Team 6: some correct
    [1, 1, 1], // Team 7: all correct
    [0, 0, 0], // Team 8: all wrong
    [1, 0, 1], // Team 9: mostly correct
    [1, 1, 0], // Team 10: mostly correct
    [0, 1, 1], // Team 11: mostly correct
    [1, 0, 1], // Team 12: mostly correct
    [0, 0, 1], // Team 13: some correct
    [1, 1, 1], // Team 14: all correct
    [0, 1, 0], // Team 15: some correct
    [1, 0, 0], // Team 16: some correct
    [0, 0, 0], // Team 17: all wrong
    [1, 1, 0], // Team 18: mostly correct
    [0, 1, 1], // Team 19: mostly correct
    [1, 0, 1], // Team 20: mostly correct
    [1, 1, 1], // Team 21: all correct
    [0, 0, 1], // Team 22: some correct
    [1, 0, 0], // Team 23: some correct
    [0, 1, 0], // Team 24: some correct
    [1, 1, 0], // Team 25: mostly correct
    [0, 0, 0], // Team 26: all wrong
    [1, 0, 1], // Team 27: mostly correct
    [0, 1, 1], // Team 28: mostly correct
    [1, 1, 1], // Team 29: all correct
  ];

  for (let i = 0; i < teams.length; i++) {
    const { team } = teams[i];
    const pattern = answerPatterns[i % answerPatterns.length];

    for (const question of allQuestions) {
      // Only answer if episode has passed
      if (question.episodeNumber <= 10) {
        // Determine if this answer is correct based on pattern
        const patternIndex = question.sortOrder % pattern.length;
        const shouldBeCorrect = pattern[patternIndex] === 1;

        let answer = question.correctAnswer || '';

        if (!shouldBeCorrect) {
          // Generate a wrong answer
          if (question.type === 'MULTIPLE_CHOICE' && question.options) {
            const options = question.options as string[];
            const wrongOptions = options.filter(o => o !== question.correctAnswer);
            answer = wrongOptions[i % wrongOptions.length] || options[0];
          } else {
            // For fill-in-the-blank, use a castaway name that's not correct
            const wrongNames = castawayNames.filter(n => n !== question.correctAnswer);
            answer = wrongNames[i % wrongNames.length] || castawayNames[0];
          }
        }

        // Wager amount for wager questions
        let wagerAmount = null;
        if (question.isWager) {
          wagerAmount = Math.floor(Math.random() * ((question.maxWager || 10) - (question.minWager || 1) + 1)) + (question.minWager || 1);
        }

        const pointsEarned = shouldBeCorrect
          ? (question.isWager && wagerAmount ? wagerAmount : question.pointValue)
          : (question.isWager && wagerAmount ? -wagerAmount : 0);

        await prisma.playerAnswer.create({
          data: {
            leagueQuestionId: question.id,
            teamId: team.id,
            answer,
            wagerAmount,
            pointsEarned,
          },
        });
      }
    }
  }

  // Calculate episode points for each team
  console.log('📊 Calculating episode points...');
  for (const { team } of teams) {
    let runningTotal = 0;

    for (let ep = 1; ep <= 10; ep++) {
      // Question points
      const questionPoints = await prisma.playerAnswer.aggregate({
        where: {
          teamId: team.id,
          leagueQuestion: {
            episodeNumber: ep,
          },
        },
        _sum: {
          pointsEarned: true,
        },
      });

      // Retention points (count active castaways)
      const activeCastawaysCount = await prisma.teamCastaway.count({
        where: {
          teamId: team.id,
          startEpisode: { lte: ep },
          OR: [
            { endEpisode: null },
            { endEpisode: { gte: ep } },
          ],
        },
      });

      const retentionPoints = activeCastawaysCount * 2; // 2 points per active castaway
      const totalEpisodePoints = (questionPoints._sum.pointsEarned || 0) + retentionPoints;
      runningTotal += totalEpisodePoints;

      await prisma.teamEpisodePoints.create({
        data: {
          teamId: team.id,
          episodeNumber: ep,
          questionPoints: questionPoints._sum.pointsEarned || 0,
          retentionPoints,
          totalEpisodePoints,
          runningTotal,
        },
      });
    }

    // Update team total points
    await prisma.team.update({
      where: { id: team.id },
      data: { totalPoints: runningTotal },
    });
  }

  console.log('✅ Mid-season seed complete!');
  console.log('\n📋 Summary:');
  console.log(`   Season: ${season.number} - ${season.name}`);
  console.log(`   Castaways: ${castaways.length} (10 active, 4 jury, 4 eliminated)`);
  console.log(`   Episodes: 10`);
  console.log(`   League: ${league.name}`);
  console.log(`   Teams: ${teams.length}`);
  console.log(`   Questions: ${allQuestions.length} total across all episodes`);
  console.log(`   Answers: ${allQuestions.length * teams.length} total`);
  console.log('\n🎮 Ready to play!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
