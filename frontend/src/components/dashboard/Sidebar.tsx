'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from '@chakra-ui/react';
import {
  DashboardIcon,
  StandingsIcon,
  WeeklyQuestionsIcon,
  DraftIcon,
  SettingsIcon,
  CollapseIcon,
  ChevronDownIcon,
  AdminIcon,
  FireIcon,
} from './icons';
import type { League, SeasonMetadata, User, EpisodeState, LeagueEpisodeState } from '@/types/api';

interface SidebarProps {
  league?: League | null;
  seasonMetadata?: SeasonMetadata | null;
  isAdmin?: boolean;
  currentLeagueId?: string;
  userLeagues?: League[];
  currentUser?: User | null;
  currentEpisodeState?: LeagueEpisodeState | null;
  isCommissioner?: boolean;
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
  isCollapsed?: boolean;
}

const NavLink = ({ href, icon, children, isActive = false, isCollapsed = false }: NavLinkProps) => {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      justifyContent={isCollapsed ? "center" : "flex-start"}
      onClick={() => router.push(href)}
      bg={isActive ? 'rgba(240, 101, 66, 0.1)' : 'transparent'}
      border={isActive ? '1px solid' : 'none'}
      borderColor={isActive ? 'rgba(240, 101, 66, 0.2)' : 'transparent'}
      color={isActive ? 'brand.primary' : 'text.secondary'}
      fontWeight={isActive ? 'extrabold' : 'medium'}
      borderRadius="12px"
      px={3}
      py={2.5}
      h="40px"
      w="full"
      cursor="pointer"
      _hover={{
        bg: isActive ? 'rgba(240, 101, 66, 0.1)' : 'rgba(240, 101, 66, 0.05)',
      }}
    >
      <HStack gap={3} w="full" align="center">
        <Box boxSize="20px" flexShrink={0}>{icon}</Box>
        {!isCollapsed && (
          typeof children === 'string' ? (
            <Text fontSize="14px" fontFamily="body">
              {children}
            </Text>
          ) : (
            children
          )
        )}
      </HStack>
    </Button>
  );
};

export function Sidebar({ league, seasonMetadata, isAdmin, currentLeagueId, userLeagues = [], currentUser, currentEpisodeState, isCommissioner: isCommissionerProp }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const baseUrl = league ? `/leagues/${league.slug || league.id}` : '';

  // Get season number - try metadata first, then fallback to league's season data
  const getSeasonNumber = () => {
    if (seasonMetadata?.number) {
      return seasonMetadata.number;
    }
    // Fallback: get from league's active season or most recent season
    if (league?.leagueSeasons && league.leagueSeasons.length > 0) {
      // Try to find active season
      const activeSeason = league.leagueSeasons.find(
        (ls: any) => ls.season?.status === 'ACTIVE'
      );
      if (activeSeason?.season?.number) {
        return activeSeason.season.number;
      }
      // If no active season, use the most recent one (first in list since ordered by number desc)
      return league.leagueSeasons[0]?.season?.number || null;
    }
    return null;
  };

  const seasonNumber = league ? getSeasonNumber() : null;

  const isActive = (path: string) => {
    if (!league) {
      // Global navigation - check exact path
      return pathname === path;
    }
    // League-specific navigation
    if (path === `${baseUrl}/dashboard`) {
      return pathname === path || pathname === baseUrl;
    }
    return pathname.startsWith(path);
  };

  // Check if current user is commissioner (owner or in commissioners array)
  const isCommissioner = isCommissionerProp ?? (league && currentUser && (
    league.ownerId === currentUser.id ||
    league.commissioners?.some(c => c.id === currentUser.id)
  ));

  // Compute badge for Weekly Team Questions based on episode state
  const getQuestionsBadge = (): { label: string; bg: string; color: string } | null => {
    if (!currentEpisodeState) {
      // Fallback to old behavior for upcoming season
      if (seasonMetadata?.status === 'UPCOMING') {
        return {
          label: 'SOON',
          bg: 'rgba(240, 101, 66, 0.15)',
          color: 'brand.primary',
        };
      }
      return null;
    }

    const { state, needsScoring, questionsReady } = currentEpisodeState;

    // Commissioner-specific badges
    if (isCommissioner) {
      if (needsScoring) {
        return {
          label: 'SCORE',
          bg: 'rgba(236, 201, 75, 0.15)',
          color: 'yellow.400',
        };
      }
      if (!questionsReady && state !== 'FUTURE') {
        return {
          label: 'SETUP',
          bg: 'rgba(237, 137, 54, 0.15)',
          color: 'orange.400',
        };
      }
    }

    // Badges for all users
    switch (state) {
      case 'SUBMISSIONS_OPEN':
        return {
          label: 'OPEN',
          bg: 'rgba(72, 187, 120, 0.15)',
          color: 'green.400',
        };
      case 'FULLY_SCORED':
        return {
          label: 'DONE',
          bg: 'rgba(72, 187, 120, 0.15)',
          color: 'green.400',
        };
      case 'FUTURE':
        return {
          label: 'SOON',
          bg: 'rgba(240, 101, 66, 0.15)',
          color: 'brand.primary',
        };
      default:
        return null;
    }
  };

  const questionsBadge = getQuestionsBadge();

  const handleLeagueSwitch = (switchLeague: { id: string; slug: string }) => {
    // Navigate to the new league's dashboard using slug
    router.push(`/leagues/${switchLeague.slug || switchLeague.id}/dashboard`);
  };

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
    <Box
      w={isCollapsed ? "80px" : "256px"}
      minW={isCollapsed ? "80px" : "256px"}
      bg="bg.secondary"
      borderRight="1px solid"
      borderColor="rgba(48, 53, 65, 0.5)"
      position="fixed"
      top="64px"
      left="0"
      h="calc(100vh - 64px)"
      display="flex"
      flexDirection="column"
      transition="all 0.3s ease"
      overflow="hidden"
      zIndex={10}
    >
      <VStack align="stretch" flex="1" px={1} pt={4} pb={8} gap={3}>
        {/* League Selector - Only show if user has multiple leagues */}
        {league && userLeagues.length > 1 && (
          <Box
            px={3}
            pb={4}
            borderBottom="2px solid"
            borderColor="rgba(48, 53, 65, 0.5)"
          >
            <Menu placement="bottom-end">
              <MenuButton
                as={Button}
                w="full"
                h="48px"
                bg="rgba(30, 36, 48, 0.85)"
                backdropFilter="blur(8px)"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.08)"
                borderRadius="12px"
                boxShadow="0 2px 4px rgba(0, 0, 0, 0.2)"
                _hover={{
                  bg: 'rgba(40, 46, 58, 0.9)',
                  borderColor: 'rgba(240, 101, 66, 0.3)',
                  boxShadow: '0 0 20px rgba(240, 101, 66, 0.1)'
                }}
                _active={{
                  bg: 'rgba(35, 41, 53, 0.95)',
                  transform: 'scale(0.98)'
                }}
                px={3}
                transition="all 0.2s ease"
              >
                {isCollapsed ? (
                  <HStack w="full" justify="center" minW={0}>
                    <Text
                      fontFamily="heading"
                      fontSize="12px"
                      fontWeight="semibold"
                      color="text.primary"
                      noOfLines={1}
                      isTruncated
                    >
                      {league.name}
                    </Text>
                  </HStack>
                ) : (
                  <HStack w="full" justify="space-between" gap={2} minW={0}>
                    <Text
                      fontFamily="heading"
                      fontSize="14px"
                      fontWeight="medium"
                      color="text.primary"
                      noOfLines={2}
                      flex="1"
                      minW={0}
                      lineHeight="1.3"
                    >
                      {league.name}
                    </Text>
                    <ChevronDownIcon boxSize="16px" color="text.secondary" flexShrink={0} />
                  </HStack>
                )}
              </MenuButton>
              <Portal>
                <MenuList
                  bg="bg.secondary"
                  borderColor="rgba(48, 53, 65, 0.5)"
                  minW="240px"
                  py={2}
                >
                  {userLeagues.map((l) => (
                    <MenuItem
                      key={l.id}
                      onClick={() => handleLeagueSwitch(l)}
                      bg={l.id === league.id ? 'rgba(240, 101, 66, 0.1)' : 'transparent'}
                      _hover={{ bg: 'rgba(240, 101, 66, 0.05)' }}
                      px={4}
                      py={3}
                    >
                      <HStack gap={3} w="full" minW={0}>
                        <VStack align="start" gap={0} flex="1" minW={0}>
                          <Text
                            fontFamily="heading"
                            fontSize="14px"
                            color="text.primary"
                            fontWeight={l.id === league.id ? 'bold' : 'medium'}
                            noOfLines={1}
                            isTruncated
                          >
                            {l.name}
                          </Text>
                        </VStack>
                        {l.id === league.id && (
                          <Box
                            boxSize="8px"
                            borderRadius="full"
                            bg="brand.primary"
                            flexShrink={0}
                          />
                        )}
                      </HStack>
                    </MenuItem>
                  ))}
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        )}

        {/* Navigation - Only show league nav if in league context */}
        <VStack align="stretch" gap={1} px={3} flex="1">
          {league && (
            <>
              <NavLink
                href={`${baseUrl}/dashboard`}
                icon={<DashboardIcon boxSize="20px" />}
                isActive={isActive(`${baseUrl}/dashboard`)}
                isCollapsed={isCollapsed}
              >
                Dashboard
              </NavLink>
              <NavLink
                href={`${baseUrl}/standings`}
                icon={<StandingsIcon boxSize="20px" />}
                isActive={isActive(`${baseUrl}/standings`)}
                isCollapsed={isCollapsed}
              >
                Standings
              </NavLink>
              <NavLink
                href={
                  isCommissioner && currentEpisodeState?.needsScoring
                    ? `${baseUrl}/settings?tab=questions`
                    : `${baseUrl}/questions`
                }
                icon={<WeeklyQuestionsIcon boxSize="20px" />}
                isActive={isActive(`${baseUrl}/questions`)}
                isCollapsed={isCollapsed}
              >
                <HStack justify="space-between" flex="1" gap={2} minW={0}>
                  <Text fontSize="14px" fontFamily="body" isTruncated>Questions</Text>
                  {questionsBadge && (
                    <Badge
                      fontSize="9px"
                      px={1.5}
                      py={0.5}
                      borderRadius="full"
                      bg={questionsBadge.bg}
                      color={questionsBadge.color}
                      fontWeight="bold"
                      flexShrink={0}
                    >
                      {questionsBadge.label}
                    </Badge>
                  )}
                </HStack>
              </NavLink>
              <NavLink
                href={`${baseUrl}/draft`}
                icon={<DraftIcon boxSize="20px" />}
                isActive={isActive(`${baseUrl}/draft`)}
                isCollapsed={isCollapsed}
              >
                Draft
              </NavLink>
              {isCommissioner && (
                <NavLink
                  href={`${baseUrl}/settings`}
                  icon={<SettingsIcon boxSize="20px" />}
                  isActive={isActive(`${baseUrl}/settings`)}
                  isCollapsed={isCollapsed}
                >
                  League Settings
                </NavLink>
              )}
            </>
          )}
        </VStack>

        {/* Bottom Section */}
        <VStack
          align="stretch"
          gap={1}
          px={3}
          pt={3.5}
          borderTop="2px solid"
          borderColor="rgba(48, 53, 65, 0.5)"
        >
          {/* Create League Button */}
          <NavLink
            href="/leagues/create"
            icon={<Box fontSize="20px">🏝️</Box>}
            isActive={pathname === '/leagues/create'}
            isCollapsed={isCollapsed}
          >
            Create League
          </NavLink>

          {/* Join League Button */}
          <NavLink
            href="/leagues/join"
            icon={<Box fontSize="20px">🤝</Box>}
            isActive={pathname === '/leagues/join'}
            isCollapsed={isCollapsed}
          >
            Join League
          </NavLink>

          {/* How to Play */}
          <NavLink
            href="/how-to-play"
            icon={<FireIcon boxSize="20px" />}
            isActive={pathname === '/how-to-play'}
            isCollapsed={isCollapsed}
          >
            How to Play
          </NavLink>

          {/* Super Admin Link - Only show for admin users */}
          {isAdmin && (
            <NavLink
              href="/admin"
              icon={<AdminIcon boxSize="20px" />}
              isActive={isActive('/admin')}
              isCollapsed={isCollapsed}
            >
              Super Admin
            </NavLink>
          )}

          {/* Collapse */}
          <Button
            variant="ghost"
            justifyContent={isCollapsed ? "center" : "flex-start"}
            color="text.secondary"
            fontWeight="normal"
            borderRadius="12px"
            border="none"
            px={3}
            py={2}
            h="36px"
            w="full"
            _hover={{ bg: 'rgba(240, 101, 66, 0.05)' }}
            _focus={{ boxShadow: 'none', outline: 'none' }}
            _focusVisible={{ boxShadow: 'none', outline: 'none' }}
            onClick={handleCollapse}
            cursor="pointer"
          >
            <HStack gap={3}>
              <CollapseIcon
                boxSize="20px"
                transform={isCollapsed ? 'rotate(180deg)' : 'none'}
                transition="transform 0.3s ease"
              />
              {!isCollapsed && (
                <Text fontSize="14px" fontFamily="body">
                  Collapse
                </Text>
              )}
            </HStack>
          </Button>
        </VStack>
      </VStack>
    </Box>
    {/* Spacer to push main content */}
    <Box
      w={isCollapsed ? "80px" : "256px"}
      minW={isCollapsed ? "80px" : "256px"}
      flexShrink={0}
      transition="all 0.3s ease"
    />
    </>
  );
}
