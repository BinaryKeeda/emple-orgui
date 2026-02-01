import { getSessionToken } from '@descope/react-sdk';

export const withToken = async (
  cb: (token: string) => Promise<void>): Promise<void> => {
  const token = getSessionToken();

  if (!token) {
    throw new Error('No session token found');
  }

  return await cb(token);
};
