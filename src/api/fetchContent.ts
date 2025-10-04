// api/content.ts
import axios from 'axios';
import { BASE_URL } from '../config/config';
import { type SectionContentResponse } from '../types/content';

interface FetchSectionContentParams {
  sectionId: string;
  type: 'quiz' | 'test';
  page?: number;
  limit?: number;
}

export const fetchSectionContent = async ({
  sectionId,
  type,
  page = 1,
  limit = 10,
}: FetchSectionContentParams): Promise<SectionContentResponse> => {
  const { data } = await axios.get<SectionContentResponse>(
    `${BASE_URL}/api/campus/${type}/get/section/${sectionId}`,
    { params: { page, limit }, withCredentials: true }
  );
  return data;
};
