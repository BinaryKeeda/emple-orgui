import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { GROUP_ROUTES, userApi } from "./api";

interface Invite {
  _id: string;
  invitedBy?: {
    name?: string;
  };
  role: string;
  createdAt: string;
  sectionId: string;
}

const fetchInviteData = async (userId: string): Promise<Invite[]> => {
  const res = await userApi.get(GROUP_ROUTES.GET_USER_INVITE + userId);
  return res.data.data;
};

interface UseInvitationProps {
  userId: string;
}

const useInvitation = ({
  userId,
}: UseInvitationProps): UseQueryResult<Invite[]> => {
  return useQuery<Invite[]>({
    queryKey: ["inviteData", userId],
    queryFn: () => fetchInviteData(userId),
    // ❗ onSuccess context is not available in useQuery
    
    // You can use queryClient directly if needed
  });
};

export default useInvitation;
