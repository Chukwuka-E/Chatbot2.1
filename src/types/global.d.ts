export type Environment = 'development' | 'production' | 'test';

export type SearchResult = {
  title: string;
  link: string;
  snippet: string;
  position?: number;
};