'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  Image,
} from '@chakra-ui/react';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import {
  DashboardIcon,
  StandingsIcon,
  WeeklyQuestionsIcon,
  DraftIcon,
  HistoryIcon,
  SettingsIcon,
  LogoutIcon,
  CollapseIcon,
  ChevronDownIcon,
  AdminIcon,
  ProfileIcon,
} from './icons';
import type { League, SeasonMetadata } from '@/types/api';

interface SidebarProps {
  league?: League | null;
  seasonMetadata?: SeasonMetadata | null;
  isAdmin?: boolean;
  currentLeagueId?: string;
  userLeagues?: League[];
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

export function Sidebar({ league, seasonMetadata, isAdmin, currentLeagueId, userLeagues = [] }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const baseUrl = league ? `/leagues/${league.id}` : '';

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

  const handleLogout = () => {
    signOut({ redirectUrl: '/' });
  };

  const handleLeagueSwitch = (newLeagueId: string) => {
    // Navigate to the new league's dashboard
    router.push(`/leagues/${newLeagueId}/dashboard`);
  };

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box
      w={isCollapsed ? "80px" : "256px"}
      minW={isCollapsed ? "80px" : "256px"}
      bg="bg.secondary"
      borderRight="1px solid"
      borderColor="rgba(48, 53, 65, 0.5)"
      position="sticky"
      top="0"
      h="100vh"
      display="flex"
      flexDirection="column"
      transition="all 0.3s ease"
      overflow="hidden"
    >
      <VStack align="stretch" flex="1" px={1} pt={4} pb={8} gap={3}>
        {/* Logo Section */}
        <HStack
          gap={4}
          px={4}
          pb={4}
          borderBottom="2px solid"
          borderColor="rgba(48, 53, 65, 0.5)"
          justify={isCollapsed ? "center" : "flex-start"}
        >
          <Image
            src={getCloudinaryUrl('main-logo', { height: 120, crop: 'fit', format: 'png', trim: true })}
            alt="Survivor Fantasy League"
            h="40px"
            w="auto"
            flexShrink={0}
          />
          {!isCollapsed && (
            <HStack gap={1} whiteSpace="nowrap">
              <Text
                fontFamily="heading"
                fontSize="13px"
                fontWeight="bold"
                color="brand.primary"
                letterSpacing="1.5px"
              >
                OUTPICK
              </Text>
              <Text
                fontFamily="heading"
                fontSize="13px"
                fontWeight="bold"
                color="text.primary"
                letterSpacing="1.5px"
              >
                OUTLAST
              </Text>
            </HStack>
          )}
        </HStack>

        {/* League Selector - Only show if user has multiple leagues */}
        {league && userLeagues.length > 1 && (
          <Box
            px={3}
            pb={6}
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
                      onClick={() => handleLeagueSwitch(l.id)}
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
                href={`${baseUrl}/questions`}
                icon={<WeeklyQuestionsIcon boxSize="20px" />}
                isActive={isActive(`${baseUrl}/questions`)}
                isCollapsed={isCollapsed}
              >
                <HStack justify="space-between" flex="1" gap={2}>
                  <Text fontSize="14px" fontFamily="body">Weekly Team Questions</Text>
                  {seasonMetadata?.status === 'UPCOMING' && (
                    <Badge
                      fontSize="10px"
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      bg="rgba(240, 101, 66, 0.15)"
                      color="brand.primary"
                      fontWeight="bold"
                      flexShrink={0}
                    >
                      SOON
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
              <NavLink
                href={`${baseUrl}/history`}
                icon={<HistoryIcon boxSize="20px" />}
                isActive={isActive(`${baseUrl}/history`)}
                isCollapsed={isCollapsed}
              >
                History
              </NavLink>
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

          {/* Profile */}
          <NavLink
            href="/profile"
            icon={<ProfileIcon boxSize="20px" />}
            isActive={pathname === '/profile'}
            isCollapsed={isCollapsed}
          >
            Profile
          </NavLink>

          {/* Admin Link - Only show for admin users */}
          {isAdmin && (
            <NavLink
              href="/admin"
              icon={<AdminIcon boxSize="20px" />}
              isActive={isActive('/admin')}
              isCollapsed={isCollapsed}
            >
              Admin
            </NavLink>
          )}

          {/* Settings - League settings if in league */}
          {league && (
            <NavLink
              href={`${baseUrl}/settings`}
              icon={<SettingsIcon boxSize="20px" />}
              isActive={isActive(`${baseUrl}/settings`)}
              isCollapsed={isCollapsed}
            >
              Settings
            </NavLink>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            justifyContent={isCollapsed ? "center" : "flex-start"}
            color="text.secondary"
            fontWeight="medium"
            borderRadius="12px"
            border="none"
            px={3}
            py={2.5}
            h="40px"
            w="full"
            _hover={{ bg: 'rgba(240, 101, 66, 0.05)' }}
            _focus={{ boxShadow: 'none', outline: 'none' }}
            _focusVisible={{ boxShadow: 'none', outline: 'none' }}
            onClick={handleLogout}
            cursor="pointer"
          >
            <HStack gap={3}>
              <LogoutIcon boxSize="20px" />
              {!isCollapsed && (
                <Text fontSize="14px" fontFamily="body">
                  Logout
                </Text>
              )}
            </HStack>
          </Button>

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
  );
}
