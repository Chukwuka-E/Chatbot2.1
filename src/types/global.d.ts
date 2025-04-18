export type SearchResult = {
    title: string;
    link: string;
    snippet: string;
    position?: number;
  };
  
  export type Environment = 'development' | 'production' | 'test';