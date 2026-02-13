import { randomUUID } from 'crypto'
import { MovieRepositoryDTO } from '@modules/catalog/repository/dto/movie.repository.dto'
import { MovieMapper } from '../mappers/movie.mapper'
import { IMovieRepository } from '../interfaces/catalog.repository.interface'
import { Movie } from '../entity/movie.entity'
import { IBookingRepository } from '@modules/booking/domain/interfaces/booking.repository.interface'
import { CreateMovieRequest, UpdateMovieRequest } from '../../presentation/dto/movie.controller.dto'

export class CatalogService {
  constructor(
    private readonly repository: IMovieRepository,
    private readonly bookingRepository: IBookingRepository,
  ) { }

  public async listAvailable(): Promise<MovieRepositoryDTO[]> {
    const expired = await this.bookingRepository.findExpiredWaiting()

    for (const booking of expired) {
      await this.repository.update(booking.movieId, { available: true })
      await this.bookingRepository.delete(booking.id)
    }

    const movies = await this.repository.findAvailable()
    return movies.map(MovieMapper.toDTO)
  }

  async getMovieDetails(id: string): Promise<MovieRepositoryDTO | null> {
    const movie = await this.repository.findById(id)
    return movie ? MovieMapper.toDTO(movie) : null
  }

  async create(input: CreateMovieRequest): Promise<MovieRepositoryDTO> {
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

  async update(id: string, input: UpdateMovieRequest): Promise<void> {
    await this.repository.update(id, input)
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}
