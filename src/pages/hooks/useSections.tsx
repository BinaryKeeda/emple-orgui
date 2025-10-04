import { useQuery } from "@tanstack/react-query";
import { adminApi, GROUP_ROUTES } from "../api/ApiRoutes";

const fetchGroups = async (groupId: string, userId?: string) => {
  const url = `${GROUP_ROUTES.GET_SECTIONS}${groupId}${userId ? `/${userId}` : ""}`;
  const res = await adminApi.get(url);
  return res.data;
};

export default function useSections(groupId: string, userId?: string) {
  return useQuery({
    queryKey: ['groups', groupId, userId],
    queryFn: () => fetchGroups(groupId, userId),
    enabled: !!groupId, // Only run if groupId exists
  });
}
