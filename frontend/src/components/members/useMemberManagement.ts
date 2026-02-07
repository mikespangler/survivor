import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { api } from '@/lib/api';
import type { User } from '@/types/api';
import type {
  LeagueMember,
  UseMemberManagementOptions,
  UseMemberManagementReturn,
} from './types';

export function useMemberManagement({
  leagueId,
  mode,
}: UseMemberManagementOptions): UseMemberManagementReturn {
  const toast = useToast();
  const [members, setMembers] = useState<LeagueMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const membersData =
        mode === 'admin'
          ? await api.getLeagueMembers(leagueId)
          : await api.getLeagueMembersAsCommissioner(leagueId);
      setMembers(membersData);
    } catch (error) {
      toast({
        title: 'Failed to load members',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [leagueId, mode, toast]);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setSearching(true);
        const results =
          mode === 'admin'
            ? await api.searchUsers(query)
            : await api.searchUsersForLeague(leagueId, query);

        // Filter out existing members (in case search endpoint doesn't do it)
        const filtered = results.filter(
          (u) => !members.some((m) => m.id === u.id)
        );
        setSearchResults(filtered);
      } catch (error) {
        toast({
          title: 'Search failed',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setSearching(false);
      }
    },
    [leagueId, mode, members, toast]
  );

  const handleAddMember = useCallback(
    async (userId: string) => {
      try {
        if (mode === 'admin') {
          await api.addMemberToLeague(leagueId, userId);
        } else {
          await api.addMemberAsCommissioner(leagueId, userId);
        }
        toast({
          title: 'Member added successfully',
          status: 'success',
          duration: 3000,
        });
        setSearchResults([]);
        await loadData();
      } catch (error) {
        toast({
          title: 'Failed to add member',
          description: error instanceof Error ? error.message : undefined,
          status: 'error',
          duration: 3000,
        });
      }
    },
    [leagueId, mode, loadData, toast]
  );

  const handleRemoveMember = useCallback(
    async (member: LeagueMember) => {
      try {
        if (mode === 'admin') {
          await api.removeMemberFromLeague(leagueId, member.id);
        } else {
          await api.removeMemberAsCommissioner(leagueId, member.id);
        }
        toast({
          title: 'Member removed successfully',
          status: 'success',
          duration: 3000,
        });
        await loadData();
      } catch (error) {
        toast({
          title: 'Failed to remove member',
          description: error instanceof Error ? error.message : undefined,
          status: 'error',
          duration: 3000,
        });
      }
    },
    [leagueId, mode, loadData, toast]
  );

  const handleToggleCommissioner = useCallback(
    async (member: LeagueMember) => {
      try {
        setChangingRoleId(member.id);
        if (member.isCommissioner) {
          await api.removeCommissioner(leagueId, member.id);
        } else {
          await api.addCommissioner(leagueId, { userId: member.id });
        }
        toast({
          title: member.isCommissioner
            ? 'Commissioner removed'
            : 'Commissioner added',
          status: 'success',
          duration: 3000,
        });
        await loadData();
      } catch (error) {
        toast({
          title: `Failed to ${member.isCommissioner ? 'remove' : 'add'} commissioner`,
          description: error instanceof Error ? error.message : undefined,
          status: 'error',
          duration: 3000,
        });
      } finally {
        setChangingRoleId(null);
      }
    },
    [leagueId, loadData, toast]
  );

  const handleSendEmailInvites = useCallback(
    async (emails: string[]) => {
      if (emails.length === 0) {
        toast({
          title: 'Please enter at least one email',
          status: 'warning',
          duration: 3000,
        });
        return;
      }

      try {
        setSending(true);
        if (mode === 'admin') {
          const result = await api.sendEmailInvites(leagueId, emails);
          toast({
            title: 'Invites sent!',
            description: `Sent to ${result.invited.length} email(s). ${result.alreadyMembers.length} already members.`,
            status: 'success',
            duration: 5000,
          });
        } else {
          await api.inviteByEmail(leagueId, { emails });
          toast({
            title: 'Invitations recorded',
            description: 'You can share invite links with these users',
            status: 'success',
            duration: 3000,
          });
        }
      } catch (error) {
        toast({
          title: 'Failed to send invites',
          description: error instanceof Error ? error.message : undefined,
          status: 'error',
          duration: 3000,
        });
      } finally {
        setSending(false);
      }
    },
    [leagueId, mode, toast]
  );

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    members,
    loading,
    changingRoleId,
    searchResults,
    searching,
    sending,
    loadData,
    handleSearch,
    handleAddMember,
    handleRemoveMember,
    handleToggleCommissioner,
    handleSendEmailInvites,
    clearSearchResults,
  };
}
