// types/content.ts
export interface ContentItem {
  _id: string;
  title: string;
  marks: number;
  duration: number;
  category: string;
  difficulty: string;
  createdAt: string;
}

export interface SectionContentResponse {
  quizzes?: ContentItem[];
  tests?: ContentItem[];
  totalPages: number;
  page: number;
  limit: number;
}
