export interface CreateMovieRequest {
  name: string
  synopsis: string
  rating: string
}

export interface UpdateMovieRequest {
  name?: string
  synopsis?: string
  rating?: string
}

export interface MovieResponseDTO {
  id: string
  name: string
  synopsis: string
  rating: string
  available?: boolean
}

