'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useClerk, UserButton } from '@clerk/nextjs';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
} from '@chakra-ui/react';
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
} from './icons';
import type { League, SeasonMetadata } from '@/types/api';

interface SidebarProps {
  league?: League | null;
  seasonMetadata?: SeasonMetadata | null;
  isAdmin?: boolean;
  currentLeagueId?: string;
}

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavLink = ({ href, icon, children, isActive = false }: NavLinkProps) => (
  <Button
    as="a"
    href={href}
    variant="ghost"
    justifyContent="flex-start"
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
    _hover={{
      bg: isActive ? 'rgba(240, 101, 66, 0.1)' : 'rgba(240, 101, 66, 0.05)',
    }}
  >
    <HStack gap={3}>
      <Box boxSize="20px">{icon}</Box>
      <Text fontSize="14px" fontFamily="body">
        {children}
      </Text>
    </HStack>
  </Button>
);

export function Sidebar({ league, seasonMetadata, isAdmin, currentLeagueId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const baseUrl = league ? `/leagues/${league.id}` : '';

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

  const handleLeagueChange = () => {
    router.push('/');
  };

  return (
    <Box
      w="256px"
      minW="256px"
      bg="bg.secondary"
      borderRight="1px solid"
      borderColor="rgba(48, 53, 65, 0.5)"
      position="sticky"
      top="0"
      h="100vh"
      display="flex"
      flexDirection="column"
    >
      <VStack align="stretch" flex="1" px={1} py={8} gap={3}>
        {/* Logo Section */}
        <HStack
          gap={3}
          px={4}
          pb={4}
          borderBottom="2px solid"
          borderColor="rgba(48, 53, 65, 0.5)"
        >
          <Box
            w="53px"
            h="40px"
            bg="brand.primary"
            borderRadius="8px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontFamily="heading" fontSize="12px" color="text.button" fontWeight="bold">
              SFL
            </Text>
          </Box>
          <VStack align="start" gap={0}>
            <Text
              fontFamily="heading"
              fontSize="16px"
              color="text.primary"
              letterSpacing="0.5px"
            >
              SURVIVOR
            </Text>
            <Text
              fontFamily="body"
              fontSize="10px"
              fontWeight="medium"
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing="1px"
            >
              Fantasy League
            </Text>
          </VStack>
        </HStack>

        {/* League Selector - Only show if in league context */}
        {league && (
          <Box
            px={3}
            pb={6}
            borderBottom="2px solid"
            borderColor="rgba(48, 53, 65, 0.5)"
          >
            <Button
              w="full"
              h="51px"
              bg="brand.primary"
              color="text.button"
              borderRadius="20px"
              boxShadow="0px 6px 0px 0px #C34322"
              _hover={{ bg: '#E85A3A' }}
              _active={{ transform: 'translateY(2px)', boxShadow: '0px 3px 0px 0px #C34322' }}
              onClick={handleLeagueChange}
              px={3}
            >
              <HStack w="full" justify="space-between">
                <HStack gap={2}>
                  <Flex
                    bg="rgba(254, 254, 254, 0.2)"
                    borderRadius="full"
                    boxSize="32px"
                    align="center"
                    justify="center"
                  >
                    <Text fontFamily="body" fontSize="12px" fontWeight="bold" color="#1D222A">
                      {league.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </Flex>
                  <VStack align="start" gap={0}>
                    <Text fontFamily="heading" fontSize="14px" color="#14181F">
                      {league.name}
                    </Text>
                    <Text
                      fontFamily="body"
                      fontSize="12px"
                      fontWeight="bold"
                      color="rgba(20, 24, 31, 0.65)"
                    >
                      Season {seasonMetadata?.number || '—'}
                    </Text>
                  </VStack>
                </HStack>
                <ChevronDownIcon boxSize="16px" color="#14181F" />
              </HStack>
            </Button>
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
              >
                Dashboard
              </NavLink>
              <NavLink
                href={`${baseUrl}/standings`}
                icon={<StandingsIcon boxSize="20px" />}
                isActive={isActive(`${baseUrl}/standings`)}
              >
                Standings
              </NavLink>
              <NavLink
                href={`${baseUrl}/questions`}
                icon={<WeeklyQuestionsIcon boxSize="20px" />}
                isActive={isActive(`${baseUrl}/questions`)}
              >
                Weekly Team Questions
              </NavLink>
              <NavLink
                href={`${baseUrl}/draft`}
                icon={<DraftIcon boxSize="20px" />}
                isActive={isActive(`${baseUrl}/draft`)}
              >
                Draft
              </NavLink>
              <NavLink
                href={`${baseUrl}/history`}
                icon={<HistoryIcon boxSize="20px" />}
                isActive={isActive(`${baseUrl}/history`)}
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
          {/* User Profile */}
          <Box
            px={3}
            py={2.5}
            h="40px"
            display="flex"
            alignItems="center"
            gap={3}
          >
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-5 h-5',
                  userButtonTrigger: 'focus:shadow-none',
                },
              }}
            />
            <Text fontSize="14px" fontFamily="body" color="text.secondary" fontWeight="medium">
              Profile
            </Text>
          </Box>

          {/* Admin Link - Only show for admin users */}
          {isAdmin && (
            <NavLink
              href="/admin"
              icon={<AdminIcon boxSize="20px" />}
              isActive={isActive('/admin')}
            >
              Admin
            </NavLink>
          )}

          {/* Settings - League settings if in league, otherwise could be user settings */}
          {league && (
            <NavLink
              href={`${baseUrl}/settings`}
              icon={<SettingsIcon boxSize="20px" />}
              isActive={isActive(`${baseUrl}/settings`)}
            >
              Settings
            </NavLink>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            justifyContent="flex-start"
            color="text.secondary"
            fontWeight="medium"
            borderRadius="12px"
            px={3}
            py={2.5}
            h="40px"
            w="full"
            _hover={{ bg: 'rgba(240, 101, 66, 0.05)' }}
            onClick={handleLogout}
          >
            <HStack gap={3}>
              <LogoutIcon boxSize="20px" />
              <Text fontSize="14px" fontFamily="body">
                Logout
              </Text>
            </HStack>
          </Button>

          {/* Collapse */}
          <Button
            variant="ghost"
            justifyContent="flex-end"
            color="text.secondary"
            fontWeight="normal"
            borderRadius="12px"
            px={3}
            py={2}
            h="36px"
            w="full"
            _hover={{ bg: 'rgba(240, 101, 66, 0.05)' }}
          >
            <HStack gap={2}>
              <CollapseIcon boxSize="20px" />
              <Text fontSize="14px" fontFamily="body">
                Collapse
              </Text>
            </HStack>
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
