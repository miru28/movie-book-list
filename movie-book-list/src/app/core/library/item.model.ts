export type ItemKind = 'book' | 'movie';

export interface Item {
  id: number;
  title: string;
  kind: ItemKind; // book | movie
  creator: string; // author | director
  length: number; // pages | minutes
  year: number;
  rating: number; // 0..5
  review?: string | null;
}
