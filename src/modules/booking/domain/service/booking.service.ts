import { IBookingRepository } from '../interfaces/booking.repository.interface'
import { IMovieRepository } from '@modules/catalog/domain/interfaces/catalog.repository.interface'
import { Booking } from '../entity/booking.entity'
import { ErrorCode } from '@shared/enum/error-code.enum'
import { BookingStatus } from '@shared/enum/booking-status.enum'
import {
    ReserveMovieResponse,
    ConfirmBookingRequest,
    ConfirmBookingResponse,
    ReturnMovieResponse,
} from '../../presentation/dto/booking.controller.dto'
import { ErrorFactory } from '@shared/infra/error-factory'

export class BookingService {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly movieRepository: IMovieRepository,
    ) { }

    public async reserve(movieId: string): Promise<ReserveMovieResponse> {
        const movie = await this.movieRepository.findById(movieId)

        if (!movie || !movie.available) {
            throw ErrorFactory.create(ErrorCode.MOVIE_NOT_AVAILABLE_FOR_BOOKING)
        }

        const booking = new Booking(movieId)
        await this.bookingRepository.save(booking)

        // Regra: Torna indisponível na listagem após reservar
        await this.movieRepository.update(movieId, { available: false })

        return { reserveId: booking.id, status: BookingStatus.WAITING }
    }

    public async confirm(data: ConfirmBookingRequest): Promise<ConfirmBookingResponse> {
        const bookingData = await this.bookingRepository.findById(data.reserveId)

        if (!bookingData) {
            throw ErrorFactory.create(ErrorCode.RESERVATION_NOT_FOUND)
        }

        const booking = new Booking(
            bookingData.movieId,
            bookingData.id,
            bookingData.status,
            bookingData.expiresAt,
        )

        if (!booking.isValidForConfirmation()) {
            throw ErrorFactory.create(ErrorCode.RESERVATION_EXPIRED_OR_ALREADY_PROCESSED)
        }

        booking.markAsLeased(data.customer)
        await this.bookingRepository.save(booking)

        return { scheduleId: booking.scheduleId!, status: BookingStatus.LEASED }
    }

    public async returnMovie(scheduleId: string): Promise<ReturnMovieResponse> {
        const bookingData = await this.bookingRepository.findByScheduleId(scheduleId)

        if (!bookingData) {
            throw ErrorFactory.create(ErrorCode.RENTAL_RECORD_NOT_FOUND)
        }

        if (bookingData.status !== BookingStatus.LEASED) {
            throw ErrorFactory.create(ErrorCode.MOVIE_ALREADY_RETURNED_OR_NOT_LEASED)
        }

        const booking = new Booking(
            bookingData.movieId,
            bookingData.id,
            bookingData.status,
            bookingData.expiresAt,
        )

        booking.scheduleId = bookingData.scheduleId
        booking.customer = bookingData.customer
        booking.markAsReturned()

        await this.bookingRepository.save(booking)
        await this.movieRepository.update(bookingData.movieId, { available: true })

        return {
            scheduleId: booking.scheduleId!,
            status: BookingStatus.RETURNED,
        }
    }
}
