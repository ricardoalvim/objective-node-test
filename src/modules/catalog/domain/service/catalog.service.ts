import { MovieRepositoryDTO } from "@modules/catalog/repository/dto/movie.repository.dto"
import { IMovieRepository } from "../interfaces/catalog.repository.interface"
import { Movie } from "../entity/movie.entity"

export class CatalogService {
    constructor(private readonly repository: IMovieRepository) { }

    async listAvailable(): Promise<MovieRepositoryDTO[]> {
        const movies = await this.repository.findAvailable()
        return movies.map((movie: MovieRepositoryDTO) => ({
            id: movie.id,
            name: movie.name,
            synopsis: movie.synopsis,
            rating: movie.rating,
            available: movie.available
        }))
    }

    async getMovieDetails(id: string): Promise<MovieRepositoryDTO | null> {
        const movie = await this.repository.findById(id)
        if (!movie) return null

        return this.mapToDTO(movie)
    }

    private mapToDTO(movie: Movie): MovieRepositoryDTO {
        return {
            id: movie.id,
            name: movie.name,
            synopsis: movie.synopsis,
            rating: movie.rating,
            available: movie.available
        }
    }
}