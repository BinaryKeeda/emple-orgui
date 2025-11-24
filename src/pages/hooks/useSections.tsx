import { useQuery } from "@tanstack/react-query";
import { adminApi, GROUP_ROUTES } from "../api/ApiRoutes";

// ======================
// Fetch Function
// ======================
const fetchSections = async ({
  groupId,
  page,
  limit,
  search,
  userId,
}: {
  groupId: string;
  page: number;
  limit: number;
  search: string;
  userId?: string;
}) => {
  const url = `${GROUP_ROUTES.GET_SECTIONS}${groupId}`;

  const res = await adminApi.get(url, {
    params: {
      page,
      limit,
      search,
      userId, // optional
    },
  });

  return res.data; // contains sections + pagination
};

// ======================
// Hook
// ======================
export default function useSections(
  groupId: string,
  {
    page = 1,
    limit = 10,
    search = "",
    userId,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
  } = {}
) {
  return useQuery({
    queryKey: ["sections", groupId, page, limit, search, userId],
    queryFn: () =>
      fetchSections({
        groupId,
        page,
        limit,
        search,
        userId,
      }),
  });
}
