export interface LeagueMemberResponse {
  id: string;
  name: string | null;
  email: string | null;
  isOwner: boolean;
  isCommissioner: boolean;
  team: {
    id: string;
    name: string;
  } | null;
  joinedAt: Date;
}
