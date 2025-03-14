export interface Movie {
  id: number;
  title: string;
  description?: string;
  year: number;
  director?: string;
  genre?: string[];
  duration?: number;
  rating?: number;
  poster?: string;
  trailerUrl?: string;
  cast?: string[];
  imdbRating?: string;
  imdbVotes?: string;
  imdbId?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 