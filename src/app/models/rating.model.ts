export interface RatingRequest {
  rating: number;
  comment: string;
  movie_id: number;
}

export interface Rating {
  id?: number;
  rating: number;
  user_id?: number;
  movie_id: number;
  comment: string;
}
