import { Movie } from '../entity/movie.entity'

export interface IMovieRepository {
  findAvailable(): Promise<Movie[]>
  findById(id: string): Promise<Movie | null>
  findAll(): Promise<Movie[]>
  create(movie: Movie): Promise<string>
  update(id: string, movie: Partial<Movie>): Promise<void>
  delete(id: string): Promise<void>
}
