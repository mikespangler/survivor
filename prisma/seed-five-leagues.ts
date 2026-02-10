import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get the next Wednesday at 8pm Pacific Time
function getNextWednesdayAtEightPM(): Date {
  const now = new Date();
  
  // Get current time in Pacific (PST/PDT is UTC-8/UTC-7)
  // Convert current UTC time to Pacific time
  const pacificTimeStr = now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
  const pacificDate = new Date(pacificTimeStr);
  
  const currentDay = pacificDate.getDay();
  const currentHour = pacificDate.getHours();
  
  let daysUntilWednesday = 0;
  
  if (currentDay === 3) {
    // It's Wednesday in Pacific time
    if (currentHour < 20) {
      // Before 8pm, use today
      daysUntilWednesday = 0;
    } else {
      // After 8pm, use next Wednesday
      daysUntilWednesday = 7;
    }
  } else if (currentDay < 3) {
    // Sunday (0), Monday (1), Tuesday (2) - Wednesday is ahead this week
    daysUntilWednesday = 3 - currentDay;
  } else {
    // Thursday (4), Friday (5), Saturday (6) - Wednesday is next week
    daysUntilWednesday = 7 - currentDay + 3;
  }
  
  // Create target date in Pacific timezone
  const targetYear = pacificDate.getFullYear();
  const targetMonth = pacificDate.getMonth();
  const targetDay = pacificDate.getDate() + daysUntilWednesday;
  
  // Create a date string for the target Wednesday at 8pm Pacific
  const targetDateStr = `${targetMonth + 1}/${targetDay}/${targetYear} 20:00:00`;
  const targetInPacific = new Date(targetDateStr + ' GMT-0800'); // PST
  
  return targetInPacific;
}

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

// Team names pool
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
const userPool = [
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

// Question sets for each episode (Episodes 1-13)
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
      text: 'Who wins immunity?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Devon Williams',
      pointValue: 10,
    },
    {
      text: 'Will there be a surprise twist?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
      pointValue: 5,
    },
    {
      text: 'Who gets voted out?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Olivia Rodriguez',
      pointValue: 10,
    },
  ],
  // Episode 11
  [
    {
      text: 'Who wins immunity?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Marcus Chen',
      pointValue: 10,
    },
    {
      text: 'Will an advantage be played?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'No',
      pointValue: 5,
    },
    {
      text: 'Who joins the jury?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Jasmine Lee',
      pointValue: 10,
    },
  ],
  // Episode 12
  [
    {
      text: 'Who wins immunity?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Aisha Patel',
      pointValue: 10,
    },
    {
      text: 'Will there be a reward challenge?',
      type: 'MULTIPLE_CHOICE',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes',
      pointValue: 5,
    },
    {
      text: 'Who is voted out?',
      type: 'FILL_IN_THE_BLANK',
      correctAnswer: 'Carlos Santos',
      pointValue: 10,
      isWager: true,
      minWager: 1,
      maxWager: 30,
    },
  ],
];

// Helper function to create a user
async function createUser(name: string, email: string, systemRole = 'user') {
  return await prisma.user.create({
    data: {
      clerkId: `clerk_${email.replace(/[@.]/g, '_')}_${Date.now()}`,
      email,
      name,
      systemRole,
    },
  });
}

// Helper function to create season
async function createSeason() {
  return await prisma.season.create({
    data: {
      number: 48,
      name: 'Island of Secrets',
      status: 'ACTIVE',
      startDate: new Date('2024-09-18'),
      activeEpisode: 1,
    },
  });
}

// Helper function to create episodes
async function createEpisodes(seasonId: string, count: number, activeEpisode: number) {
  const episodes = [];
  
  // Get the next Wednesday at 8pm Pacific as the anchor date
  const nextWednesday = getNextWednesdayAtEightPM();
  
  // Calculate episode dates relative to the active episode
  // The active episode airs on the next Wednesday
  for (let i = 1; i <= count; i++) {
    const episodeDate = new Date(nextWednesday);
    // Calculate days from the next episode (activeEpisode)
    const weeksFromActive = i - activeEpisode;
    episodeDate.setDate(nextWednesday.getDate() + weeksFromActive * 7);

    const episode = await prisma.episode.create({
      data: {
        seasonId,
        number: i,
        airDate: episodeDate,
        title: i === 1 ? 'Premiere' : i === 5 ? 'The Merge' : i === 14 ? 'Finale' : undefined,
      },
    });
    episodes.push(episode);
  }
  return episodes;
}

// Helper function to create castaways with status based on episode
async function createCastaways(seasonId: string, activeEpisode: number) {
  const castaways = [];
  
  // Define elimination schedule
  const eliminationSchedule: { [key: string]: number } = {
    'Brandon Taylor': 1,
    'Nina Foster': 2,
    'Tyler Jackson': 3,
    'Jordan Hayes': 4,
    'Rachel Green': 5, // First jury
    'Alex Turner': 6,
    'Jake Morrison': 7,
    'Ryan Cooper': 8,
    'Emma Martinez': 9,
    'Olivia Rodriguez': 10,
    'Jasmine Lee': 11,
    'Carlos Santos': 12,
  };

  for (let i = 0; i < castawayNames.length; i++) {
    const name = castawayNames[i];
    const eliminatedEpisode = eliminationSchedule[name];
    
    let status = 'ACTIVE';
    if (eliminatedEpisode && eliminatedEpisode < activeEpisode) {
      // First jury member starts at episode 5, rest at episode 5+
      status = eliminatedEpisode >= 5 ? 'JURY' : 'ELIMINATED';
    }

    const castaway = await prisma.castaway.create({
      data: {
        name,
        seasonId,
        status,
      },
    });
    castaways.push(castaway);
  }
  
  return castaways;
}

// Helper function to create a league with all components
async function createLeague(config: {
  name: string;
  description: string;
  ownerUser: any;
  commissionerUser: any;
  mikeUser: any;
  seasonId: string;
  activeEpisode: number;
  draftStatus: 'PENDING' | 'COMPLETED';
  draftDate: Date;
  teamCount: number;
  castaways: any[];
  scoredEpisodes: number;
}) {
  const {
    name,
    description,
    ownerUser,
    commissionerUser,
    mikeUser,
    seasonId,
    activeEpisode,
    draftStatus,
    draftDate,
    teamCount,
    castaways,
    scoredEpisodes,
  } = config;

  // Create league
  const league = await prisma.league.create({
    data: {
      name,
      description,
      ownerId: ownerUser.id,
    },
  });

  // Create league season
  const leagueSeason = await prisma.leagueSeason.create({
    data: {
      leagueId: league.id,
      seasonId,
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
      status: draftStatus,
      draftDate,
    },
  });

  // Create teams
  const teams = [];
  const usedTeamNames = new Set();
  
  // Create Mike's team first
  const mikeTeamName = 'Tribal Council';
  usedTeamNames.add(mikeTeamName);
  const mikeTeam = await prisma.team.create({
    data: {
      name: mikeTeamName,
      leagueSeasonId: leagueSeason.id,
      ownerId: mikeUser.id,
      totalPoints: 0,
    },
  });
  teams.push({ team: mikeTeam, user: mikeUser });

  // Create other teams
  for (let i = 0; i < teamCount - 1; i++) {
    // Get a unique team name
    let teamName = teamNames[i % teamNames.length];
    let suffix = 1;
    while (usedTeamNames.has(teamName)) {
      teamName = `${teamNames[i % teamNames.length]} ${suffix}`;
      suffix++;
    }
    usedTeamNames.add(teamName);

    const user = await createUser(
      userPool[i % userPool.length].name,
      `${userPool[i % userPool.length].email.replace('@', `+${league.id}_${i}@`)}`,
    );

    const team = await prisma.team.create({
      data: {
        name: teamName,
        leagueSeasonId: leagueSeason.id,
        ownerId: user.id,
        totalPoints: 0,
      },
    });
    teams.push({ team, user });
  }

  // Add all members to league (including commissioner if different from owner)
  const memberIds = teams.map(t => ({ id: t.user.id }));
  if (commissionerUser.id !== ownerUser.id) {
    memberIds.push({ id: commissionerUser.id });
  }

  await prisma.league.update({
    where: { id: league.id },
    data: {
      members: { connect: memberIds },
      commissioners: { connect: [{ id: commissionerUser.id }] },
    },
  });

  // Draft castaways if draft is completed
  if (draftStatus === 'COMPLETED') {
    await draftCastawaysToTeams(teams, castaways, activeEpisode);
  }

  // Create retention configs
  for (let ep = 1; ep <= 14; ep++) {
    await prisma.retentionConfig.create({
      data: {
        leagueSeasonId: leagueSeason.id,
        episodeNumber: ep,
        pointsPerCastaway: 2,
      },
    });
  }

  // Create questions for scored episodes
  if (scoredEpisodes > 0) {
    await createQuestionsAndAnswers(leagueSeason.id, teams, scoredEpisodes);
  }

  return { league, leagueSeason, teams };
}

// Helper to draft castaways to teams
async function draftCastawaysToTeams(teams: any[], castaways: any[], activeEpisode: number) {
  const activeCastaways = castaways.filter(c => c.status === 'ACTIVE');
  const juryCastaways = castaways.filter(c => c.status === 'JURY');
  const eliminatedCastaways = castaways.filter(c => c.status === 'ELIMINATED');

  // Shuffle castaways for fair distribution
  const allCastaways = [...activeCastaways, ...juryCastaways, ...eliminatedCastaways];
  
  for (let i = 0; i < teams.length; i++) {
    const { team } = teams[i];
    const teamCastaways = [];

    // Each team gets 3 castaways
    for (let j = 0; j < 3; j++) {
      const castawayIndex = (i * 3 + j) % allCastaways.length;
      teamCastaways.push(allCastaways[castawayIndex]);
    }

    for (const castaway of teamCastaways) {
      let endEpisode = null;

      // Determine when they were eliminated
      const eliminationSchedule: { [key: string]: number } = {
        'Brandon Taylor': 1,
        'Nina Foster': 2,
        'Tyler Jackson': 3,
        'Jordan Hayes': 4,
        'Rachel Green': 5,
        'Alex Turner': 6,
        'Jake Morrison': 7,
        'Ryan Cooper': 8,
        'Emma Martinez': 9,
        'Olivia Rodriguez': 10,
        'Jasmine Lee': 11,
        'Carlos Santos': 12,
      };

      endEpisode = eliminationSchedule[castaway.name] || null;

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
}

// Helper to create questions and answers
async function createQuestionsAndAnswers(
  leagueSeasonId: string,
  teams: any[],
  scoredEpisodes: number,
) {
  // Create questions for scored episodes
  const allQuestions = [];
  for (let ep = 1; ep <= scoredEpisodes; ep++) {
    const questions = episodeQuestions[ep - 1];

    for (let q = 0; q < questions.length; q++) {
      const questionData = questions[q];
      const question = await prisma.leagueQuestion.create({
        data: {
          leagueSeasonId,
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
      allQuestions.push(question);
    }
  }

  // Create answers for all teams
  const answerPatterns = [
    [1, 1, 1], [1, 0, 1], [0, 1, 1], [1, 1, 0],
    [0, 0, 1], [1, 0, 0], [0, 1, 0], [1, 1, 1],
    [0, 0, 0], [1, 0, 1], [1, 1, 0], [0, 1, 1],
  ];

  for (let i = 0; i < teams.length; i++) {
    const { team } = teams[i];
    const pattern = answerPatterns[i % answerPatterns.length];

    for (const question of allQuestions) {
      const patternIndex = question.sortOrder % pattern.length;
      const shouldBeCorrect = pattern[patternIndex] === 1;

      let answer = question.correctAnswer || '';

      if (!shouldBeCorrect) {
        if (question.type === 'MULTIPLE_CHOICE' && question.options) {
          const options = question.options as string[];
          const wrongOptions = options.filter(o => o !== question.correctAnswer);
          answer = wrongOptions[i % wrongOptions.length] || options[0];
        } else {
          const wrongNames = castawayNames.filter(n => n !== question.correctAnswer);
          answer = wrongNames[i % wrongNames.length] || castawayNames[0];
        }
      }

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

  // Calculate episode points for each team
  for (const { team } of teams) {
    let runningTotal = 0;

    for (let ep = 1; ep <= scoredEpisodes; ep++) {
      const questionPoints = await prisma.playerAnswer.aggregate({
        where: {
          teamId: team.id,
          leagueQuestion: { episodeNumber: ep },
        },
        _sum: { pointsEarned: true },
      });

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

      const retentionPoints = activeCastawaysCount * 2;
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

    await prisma.team.update({
      where: { id: team.id },
      data: { totalPoints: runningTotal },
    });
  }
}

async function main() {
  console.log('🌴 Starting five-league seed for Mike Spangler...\n');

  // Clean up existing data
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
  await prisma.user.deleteMany();

  // Create Mike Spangler user
  console.log('👤 Creating Mike Spangler user...');
  const mikeUser = await createUser('Mike Spangler', 'spangler.mike@gmail.com', 'admin');

  // Create commissioners for member-only leagues
  console.log('👤 Creating commissioner users...');
  const commissioner1 = await createUser('League Commissioner Alpha', 'commissioner.alpha@example.com', 'user');
  const commissioner2 = await createUser('League Commissioner Beta', 'commissioner.beta@example.com', 'user');

  // Create season and episodes (shared by all leagues)
  console.log('📺 Creating Season 48...');
  const season = await createSeason();
  // Using episode 7 as the active episode for episode date calculation
  // This represents the "current" state of the season
  await createEpisodes(season.id, 14, 7);

  // LEAGUE 1: Pre-Draft - Not Started (Mike is commissioner)
  console.log('\n🏆 Creating League 1: [TEST] Pre-Draft - Not Started');
  const castaways1 = await createCastaways(season.id, 1);
  await prisma.season.update({
    where: { id: season.id },
    data: { activeEpisode: 1 },
  });

  const league1 = await createLeague({
    name: '[TEST] Pre-Draft - Not Started',
    description: 'Test league at the very start - no draft yet',
    ownerUser: mikeUser,
    commissionerUser: mikeUser,
    mikeUser,
    seasonId: season.id,
    activeEpisode: 1,
    draftStatus: 'PENDING',
    draftDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
    teamCount: 10,
    castaways: castaways1,
    scoredEpisodes: 0,
  });

  // LEAGUE 2: Midseason - Episode 6 (Mike is commissioner)
  console.log('\n🏆 Creating League 2: [TEST] Midseason - Episode 6');
  const castaways2 = await createCastaways(season.id, 6);
  await prisma.season.update({
    where: { id: season.id },
    data: { activeEpisode: 6 },
  });

  const league2 = await createLeague({
    name: '[TEST] Midseason - Episode 6',
    description: 'Test league at midseason with draft complete and episodes scored',
    ownerUser: mikeUser,
    commissionerUser: mikeUser,
    mikeUser,
    seasonId: season.id,
    activeEpisode: 6,
    draftStatus: 'COMPLETED',
    draftDate: new Date('2024-09-15'),
    teamCount: 12,
    castaways: castaways2,
    scoredEpisodes: 5,
  });

  // LEAGUE 3: End of Season - Episode 13 (Mike is commissioner)
  console.log('\n🏆 Creating League 3: [TEST] End of Season - Episode 13');
  const castaways3 = await createCastaways(season.id, 13);
  await prisma.season.update({
    where: { id: season.id },
    data: { activeEpisode: 13 },
  });

  const league3 = await createLeague({
    name: '[TEST] End of Season - Episode 13',
    description: 'Test league near the finale with full season history',
    ownerUser: mikeUser,
    commissionerUser: mikeUser,
    mikeUser,
    seasonId: season.id,
    activeEpisode: 13,
    draftStatus: 'COMPLETED',
    draftDate: new Date('2024-09-15'),
    teamCount: 8,
    castaways: castaways3,
    scoredEpisodes: 12,
  });

  // LEAGUE 4: Member Only - Pre-Draft (Mike is NOT commissioner)
  console.log('\n🏆 Creating League 4: [TEST] Member Only - Pre-Draft');
  const castaways4 = await createCastaways(season.id, 1);
  await prisma.season.update({
    where: { id: season.id },
    data: { activeEpisode: 1 },
  });

  const league4 = await createLeague({
    name: '[TEST] Member Only - Pre-Draft',
    description: 'Test league where Mike is a member but not commissioner',
    ownerUser: commissioner1,
    commissionerUser: commissioner1,
    mikeUser,
    seasonId: season.id,
    activeEpisode: 1,
    draftStatus: 'PENDING',
    draftDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    teamCount: 8,
    castaways: castaways4,
    scoredEpisodes: 0,
  });

  // LEAGUE 5: Member Only - Midseason (Mike is NOT commissioner)
  console.log('\n🏆 Creating League 5: [TEST] Member Only - Midseason');
  const castaways5 = await createCastaways(season.id, 7);
  await prisma.season.update({
    where: { id: season.id },
    data: { activeEpisode: 7 },
  });

  const league5 = await createLeague({
    name: '[TEST] Member Only - Midseason',
    description: 'Test league at midseason where Mike is a member but not commissioner',
    ownerUser: commissioner2,
    commissionerUser: commissioner2,
    mikeUser,
    seasonId: season.id,
    activeEpisode: 7,
    draftStatus: 'COMPLETED',
    draftDate: new Date('2024-09-15'),
    teamCount: 10,
    castaways: castaways5,
    scoredEpisodes: 6,
  });

  console.log('\n✅ Five-league seed complete!\n');
  console.log('📋 Summary:');
  console.log(`   User: ${mikeUser.name} (${mikeUser.email})`);
  console.log(`   Season: ${season.number} - ${season.name}`);
  console.log(`   \n   Leagues Created:`);
  console.log(`   1. ${league1.league.name} - ${league1.teams.length} teams (Commissioner ✓)`);
  console.log(`   2. ${league2.league.name} - ${league2.teams.length} teams (Commissioner ✓)`);
  console.log(`   3. ${league3.league.name} - ${league3.teams.length} teams (Commissioner ✓)`);
  console.log(`   4. ${league4.league.name} - ${league4.teams.length} teams (Member only)`);
  console.log(`   5. ${league5.league.name} - ${league5.teams.length} teams (Member only)`);
  console.log('\n🎮 Ready to test!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
