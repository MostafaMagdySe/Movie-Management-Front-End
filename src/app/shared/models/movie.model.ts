// Basic movie info for dashboard
export interface MovieBasic {
  title: string;
  poster: string;
  year?: string;
  genre?: string;
  imdb_rating?: string;
}

// Full movie details matching backend entity
export interface MovieDetails {
  id: number;
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: string;
  director: string;
  writer: string;
  actors: string;
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  metascore: string;
  type: string;
  boxOffice: string;
  imdbid: string;
  imdb_votes: string;
  imdb_rating: string;
  rotten_tomatoes: string;
  rotten_tomatoes_rating: string;
  metacritic: string;
  metacritic_rating: string;
  response: boolean;
} 