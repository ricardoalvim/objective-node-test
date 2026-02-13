import { Db } from 'mongodb'
import { MonitoringController } from './presentation/monitoring.controller'
import { MonitoringService } from './domain/service/monitoring.service'
import { MovieRepository } from '@modules/catalog/repository/catalog.repository'
import { BookingRepository } from '@modules/booking/repository/booking.repository'

export function makeMonitoringController(db: Db): MonitoringController {
    const movieRepository = new MovieRepository(db)
    const bookingRepository = new BookingRepository(db)
    const monitoringService = new MonitoringService(movieRepository, bookingRepository)
    return new MonitoringController(monitoringService)
}
