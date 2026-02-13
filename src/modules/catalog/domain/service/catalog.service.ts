import { randomUUID } from 'crypto'
import { MovieRepositoryDTO } from '@modules/catalog/repository/dto/movie.repository.dto'
import { MovieMapper } from '../mappers/movie.mapper'
import { IMovieRepository } from '../interfaces/catalog.repository.interface'
import { Movie } from '../entity/movie.entity'

export class CatalogService {
  constructor(private readonly repository: IMovieRepository) {}

  async listAvailable(): Promise<MovieRepositoryDTO[]> {
    const movies = await this.repository.findAvailable()
    return movies.map((movie) => MovieMapper.toDTO(movie))
  }

  async getMovieDetails(id: string): Promise<MovieRepositoryDTO | null> {
    const movie = await this.repository.findById(id)
    if (!movie) return null

    return MovieMapper.toDTO(movie)
  }

  async create(input: any): Promise<MovieRepositoryDTO> {
    const movie: Movie = {
      id: randomUUID(),
      name: input.name,
      synopsis: input.synopsis,
      rating: input.rating,
      available: true,
    }

    await this.repository.create(movie)

    return MovieMapper.toDTO(movie)
  }

  async update(id: string, input: any): Promise<void> {
    await this.repository.update(id, input)
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}
