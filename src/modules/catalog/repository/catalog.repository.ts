import { Db } from 'mongodb'
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
    const result = await this.collection.findOne({ id } as any)
    return result as Movie | null
  }

  async update(id: string, movie: Partial<Movie>): Promise<void> {
    await this.collection.updateOne({ id } as any, { $set: movie })
  }

  async findAvailable(): Promise<Movie[]> {
    return this.collection.find({ available: true }).toArray()
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ id: id } as any)
  }
}
