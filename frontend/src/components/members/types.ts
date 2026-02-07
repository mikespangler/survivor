import type { User, Team } from '@/types/api';

export interface LeagueMember {
  id: string;
  name: string | null;
  email: string | null;
  isOwner: boolean;
  isCommissioner: boolean;
  team: { id: string; name: string } | null;
  joinedAt: Date;
}

export interface MemberManagementProps {
  leagueId: string;
  leagueName: string;
  mode: 'admin' | 'commissioner';
  showBackButton?: boolean;
  onBack?: () => void;
}

export interface MemberTableProps {
  members: LeagueMember[];
  onToggleCommissioner: (member: LeagueMember) => void;
  onRemoveMember: (member: LeagueMember) => void;
  changingRoleId: string | null;
}

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => Promise<void>;
  onAddMember: (userId: string) => Promise<void>;
  searchResults: User[];
  searching: boolean;
}

export interface EmailInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvites: (emails: string[]) => Promise<void>;
  sending: boolean;
}

export interface UseMemberManagementOptions {
  leagueId: string;
  mode: 'admin' | 'commissioner';
}

export interface UseMemberManagementReturn {
  members: LeagueMember[];
  loading: boolean;
  changingRoleId: string | null;
  searchResults: User[];
  searching: boolean;
  sending: boolean;
  loadData: () => Promise<void>;
  handleSearch: (query: string) => Promise<void>;
  handleAddMember: (userId: string) => Promise<void>;
  handleRemoveMember: (member: LeagueMember) => Promise<void>;
  handleToggleCommissioner: (member: LeagueMember) => Promise<void>;
  handleSendEmailInvites: (emails: string[]) => Promise<void>;
  clearSearchResults: () => void;
}
