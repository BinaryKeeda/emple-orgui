import type { RootState } from "../store";

export const getGroupOwnerShip = (state: RootState): string | null => {
  const ownership = state.auth.user?.ownership;

  // Ensure ownership exists and is not an array
  if (ownership && !Array.isArray(ownership)) {
    return ownership.group ?? null;
  }

  return null;
};
