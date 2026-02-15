'use client';

import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  Box,
  HStack,
  Text,
  Button,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Portal,
  IconButton,
  Icon,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { getCloudinaryUrl } from '@/lib/cloudinary';
import { ChevronDownIcon, ProfileIcon, SettingsIcon, LogoutIcon } from '@/components/dashboard/icons';
import Link from 'next/link';
import type { SeasonMetadata } from '@/types/api';

const HamburgerIcon = (props: Record<string, unknown>) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </Icon>
);

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

interface AuthenticatedHeaderProps {
  userName?: string | null;
  seasonMetadata?: SeasonMetadata | null;
  leagueId?: string | null;
  hasDrafted?: boolean | null;
  onMobileNavOpen?: () => void;
}

function formatDeadline(airDate: string | null): string {
  if (!airDate) return 'TBD';
  const date = new Date(airDate);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AuthenticatedHeader({ userName, seasonMetadata, leagueId, hasDrafted, onMobileNavOpen }: AuthenticatedHeaderProps) {
  const router = useRouter();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  const displayName = userName || user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'User';

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' });
  };

  return (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      h="64px"
      zIndex={1500}
      bg="rgba(20, 24, 31, 0.9)"
      backdropFilter="blur(8px)"
      borderBottom="1px solid"
      borderColor="rgba(48, 53, 65, 0.5)"
    >
      <HStack justify="space-between" h="full" px={4}>
        {/* Left: Hamburger + Logo */}
        <HStack gap={2}>
          {/* Hamburger - mobile/tablet only */}
          <IconButton
            aria-label="Open navigation menu"
            icon={<HamburgerIcon boxSize="24px" />}
            variant="ghost"
            color="text.secondary"
            display={{ base: 'flex', lg: 'none' }}
            onClick={onMobileNavOpen}
            _hover={{ bg: 'rgba(240, 101, 66, 0.05)' }}
            size="sm"
          />
          <Link href="/leagues">
            <HStack gap={4} cursor="pointer" _hover={{ opacity: 0.9 }}>
              <Image
                src={getCloudinaryUrl('main-logo', { height: 96, crop: 'fit', format: 'png', trim: true })}
                alt="Survivor Fantasy League"
                h="32px"
                w="auto"
              />
              <HStack gap={1} display={{ base: 'none', sm: 'flex' }}>
                <Text
                  fontFamily="heading"
                  fontSize="14px"
                  fontWeight="bold"
                  color="brand.primary"
                  letterSpacing="1.5px"
                >
                  OUTPICK
                </Text>
                <Text
                  fontFamily="heading"
                  fontSize="14px"
                  fontWeight="bold"
                  color="text.primary"
                  letterSpacing="1.5px"
                >
                  OUTLAST
                </Text>
              </HStack>
            </HStack>
          </Link>
        </HStack>

        {/* Episode context - hidden on mobile, aligned after sidebar on desktop */}
        {seasonMetadata?.status === 'ACTIVE' && (
          <HStack
            gap={5}
            position="absolute"
            left="256px"
            pl={8}
            h="full"
            align="center"
            display={{ base: 'none', lg: 'flex' }}
          >
            <Text
              fontFamily="heading"
              fontSize="13px"
              fontWeight="500"
              color="text.secondary"
              letterSpacing="0.5px"
            >
              <Text as="span" color="text.primary" fontWeight="600">
                Episode {seasonMetadata.activeEpisode || '—'}
              </Text>
              {' '}· Season {seasonMetadata.number}
            </Text>
            {hasDrafted === false && seasonMetadata.draftDeadline ? (
              <Link href={leagueId ? `/leagues/${leagueId}/draft` : '#'}>
                <HStack
                  gap="6px"
                  bg="rgba(240,101,66,0.1)"
                  px={3}
                  py="5px"
                  borderRadius="20px"
                  cursor="pointer"
                  transition="all 0.15s"
                  _hover={{ bg: 'rgba(240,101,66,0.18)' }}
                >
                  <Box
                    w="6px"
                    h="6px"
                    borderRadius="50%"
                    bg="brand.primary"
                    animation={`${pulseAnimation} 2s ease-in-out infinite`}
                  />
                  <Text
                    fontFamily="heading"
                    fontSize="13px"
                    fontWeight="600"
                    color="brand.primary"
                    letterSpacing="0.3px"
                  >
                    Draft due {formatDeadline(seasonMetadata.draftDeadline)}
                  </Text>
                </HStack>
              </Link>
            ) : (
              <Link href={leagueId ? `/leagues/${leagueId}/questions` : '#'}>
                <HStack
                  gap="6px"
                  bg="rgba(244,169,58,0.1)"
                  px={3}
                  py="5px"
                  borderRadius="20px"
                  cursor="pointer"
                  transition="all 0.15s"
                  _hover={{ bg: 'rgba(244,169,58,0.18)' }}
                >
                  <Box
                    w="6px"
                    h="6px"
                    borderRadius="50%"
                    bg="#f4a93a"
                    animation={`${pulseAnimation} 2s ease-in-out infinite`}
                  />
                  <Text
                    fontFamily="heading"
                    fontSize="13px"
                    fontWeight="600"
                    color="#f4a93a"
                    letterSpacing="0.3px"
                  >
                    Picks due {formatDeadline(seasonMetadata.currentEpisode?.airDate || null)}
                  </Text>
                </HStack>
              </Link>
            )}
          </HStack>
        )}

        {/* Right: User menu */}
        <Menu placement="bottom-end">
          <MenuButton
            as={Button}
            variant="ghost"
            px={3}
            h="40px"
            borderRadius="12px"
            _hover={{ bg: 'rgba(240, 101, 66, 0.05)' }}
            _active={{ bg: 'rgba(240, 101, 66, 0.1)' }}
          >
            <HStack gap={3}>
              <Avatar
                size="sm"
                name={displayName}
                src={user?.imageUrl}
                bg="brand.primary"
              />
              <Text
                color="text.primary"
                fontSize="14px"
                fontWeight="medium"
                display={{ base: 'none', md: 'block' }}
              >
                {displayName}
              </Text>
              <ChevronDownIcon boxSize="16px" color="text.secondary" />
            </HStack>
          </MenuButton>
          <Portal>
            <MenuList
              bg="bg.secondary"
              borderColor="rgba(48, 53, 65, 0.5)"
              minW="200px"
              py={2}
            >
              <MenuItem
                onClick={() => router.push('/profile')}
                bg="transparent"
                _hover={{ bg: 'rgba(240, 101, 66, 0.05)' }}
                px={4}
                py={3}
              >
                <HStack gap={3}>
                  <ProfileIcon boxSize="18px" color="text.secondary" />
                  <Text fontSize="14px" color="text.primary">Edit Profile</Text>
                </HStack>
              </MenuItem>
              <MenuItem
                onClick={() => openUserProfile()}
                bg="transparent"
                _hover={{ bg: 'rgba(240, 101, 66, 0.05)' }}
                px={4}
                py={3}
              >
                <HStack gap={3}>
                  <SettingsIcon boxSize="18px" color="text.secondary" />
                  <Text fontSize="14px" color="text.primary">Manage Account</Text>
                </HStack>
              </MenuItem>
              <MenuDivider borderColor="rgba(48, 53, 65, 0.5)" />
              <MenuItem
                onClick={handleSignOut}
                bg="transparent"
                _hover={{ bg: 'rgba(240, 101, 66, 0.05)' }}
                px={4}
                py={3}
              >
                <HStack gap={3}>
                  <LogoutIcon boxSize="18px" color="text.secondary" />
                  <Text fontSize="14px" color="text.primary">Sign Out</Text>
                </HStack>
              </MenuItem>
            </MenuList>
          </Portal>
        </Menu>
      </HStack>
    </Box>
  );
}

export default AuthenticatedHeader;
