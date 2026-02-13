import { Db } from 'mongodb'
import { BookingController } from './presentation/booking.controller'
import { BookingService } from './domain/service/booking.service'
import { BookingRepository } from './repository/booking.repository'
import { MovieRepository } from '@modules/catalog/repository/catalog.repository'

export const makeBookingController = (db: Db): BookingController => {
  const bookingRepository = new BookingRepository(db)
  const movieRepository = new MovieRepository(db)
  const service = new BookingService(bookingRepository, movieRepository)
  return new BookingController(service)
}
