import { MovieRepositoryDTO } from '@modules/catalog/repository/dto/movie.repository.dto'
import { Movie } from '../entity/movie.entity'

export class MovieMapper {
  static toDTO(movie: Movie): MovieRepositoryDTO {
    return {
      id: movie.id,
      name: movie.name,
      synopsis: movie.synopsis,
      rating: movie.rating,
      available: movie.available,
    }
  }
}
