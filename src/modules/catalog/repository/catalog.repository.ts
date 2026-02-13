import { Db, Filter, UpdateFilter } from 'mongodb'
import { BaseRepository } from '@shared/infra/repository.base'
import { IMovieRepository } from '../domain/interfaces/catalog.repository.interface'
import { Movie } from '../domain/entity/movie.entity'

export class MovieRepository extends BaseRepository<Movie> implements IMovieRepository {
  constructor(db: Db) {
    super(db, 'movies')
  }

  async create(movie: Movie): Promise<string> {
    return super.create(movie)
  }

  async findById(id: string): Promise<Movie | null> {
    const query: Filter<Movie> = { id }
    const result = await this.collection.findOne(query)
    return result as Movie | null
  }

  async update(id: string, movie: Partial<Movie>): Promise<void> {
    const query: Filter<Movie> = { id }
    const update: UpdateFilter<Movie> = { $set: movie }
    await this.collection.updateOne(query, update)
  }

  async findAvailable(): Promise<Movie[]> {
    const query: Filter<Movie> = { available: true }
    return this.collection.find(query).toArray()
  }

  async delete(id: string): Promise<void> {
    const query: Filter<Movie> = { id }
    await this.collection.deleteOne(query)
  }
}
