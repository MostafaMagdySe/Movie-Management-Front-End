export interface Movie {
  id: number;
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Metascore: string;
  Type: string;
  BoxOffice: string;
  imdbid: string;
  imdb_votes: string;
  imdb_rating: string;
  rotten_tomatoes?: string;
  rotten_tomatoes_rating?: string;
  metacritic?: string;
  metacritic_rating?: string;
  Response: boolean;
} 