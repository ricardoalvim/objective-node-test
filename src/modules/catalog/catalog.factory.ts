import { Db } from 'mongodb'
import { CatalogController } from './presentation/catalog.controller'
import { CatalogService } from './domain/service/catalog.service'
import { MovieRepository } from './repository/catalog.repository'
import { BookingRepository } from '@modules/booking/repository/booking.repository'

export const makeCatalogController = (db: Db): CatalogController => {
  const movieRepository = new MovieRepository(db)
  const bookingRepository = new BookingRepository(db)
  const service = new CatalogService(movieRepository, bookingRepository)
  return new CatalogController(service)
}
