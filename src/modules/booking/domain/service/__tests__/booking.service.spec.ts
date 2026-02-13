import { BookingService } from '../booking.service'
import { IBookingRepository } from '../../interfaces/booking.repository.interface'
import { IMovieRepository } from '@modules/catalog/domain/interfaces/catalog.repository.interface'
import { BookingStatus } from '@shared/enum/booking-status.enum'

describe('BookingService', () => {
    let bookingService: BookingService
    let bookingRepositoryMock: jest.Mocked<IBookingRepository>
    let movieRepositoryMock: jest.Mocked<IMovieRepository>

    beforeEach(() => {
        bookingRepositoryMock = {
            save: jest.fn(),
            findById: jest.fn(),
            findByScheduleId: jest.fn(),
            findExpiredWaiting: jest.fn(),
            delete: jest.fn(),
        } as any

        movieRepositoryMock = {
            findById: jest.fn(),
            update: jest.fn(),
            findAvailable: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        } as any

        bookingService = new BookingService(bookingRepositoryMock, movieRepositoryMock)
    })

    describe('reserve', () => {
        it('deve reservar um filme disponível', async () => {
            const movieId = 'movie-1'
            movieRepositoryMock.findById.mockResolvedValue({
                id: movieId,
                name: 'Matrix',
                synopsis: 'Sci-fi',
                rating: '5',
                available: true,
            } as any)

            const result = await bookingService.reserve(movieId)

            expect(result.status).toBe(BookingStatus.WAITING)
            expect(result.reserveId).toBeDefined()
            expect(bookingRepositoryMock.save).toHaveBeenCalled()
            expect(movieRepositoryMock.update).toHaveBeenCalledWith(movieId, { available: false })
        })

        it('deve lançar erro ao tentar reservar filme indisponível', async () => {
            const movieId = 'movie-1'
            movieRepositoryMock.findById.mockResolvedValue({
                id: movieId,
                name: 'Matrix',
                available: false,
            } as any)

            await expect(bookingService.reserve(movieId)).rejects.toThrow(
                'Movie not available for booking',
            )
        })

        it('deve lançar erro ao tentar reservar filme inexistente', async () => {
            movieRepositoryMock.findById.mockResolvedValue(null)

            await expect(bookingService.reserve('non-existent')).rejects.toThrow(
                'Movie not available for booking',
            )
        })
    })

    describe('confirm', () => {
        it('deve confirmar uma reserva ativa', async () => {
            const reserveId = 'reserve-1'
            const movieId = 'movie-1'

            bookingRepositoryMock.findById.mockResolvedValue({
                id: reserveId,
                movieId,
                status: BookingStatus.WAITING,
                expiresAt: new Date(Date.now() + 60000), // Expira em 1 minuto
            } as any)

            const customer = { name: 'John Doe', email: 'john@test.com', phone: '123456789' }
            const result = await bookingService.confirm({ reserveId, customer })

            expect(result.status).toBe(BookingStatus.LEASED)
            expect(result.scheduleId).toBeDefined()
            expect(bookingRepositoryMock.save).toHaveBeenCalled()
        })

        it('deve lançar erro ao tentar confirmar reserva não encontrada', async () => {
            bookingRepositoryMock.findById.mockResolvedValue(null)

            await expect(
                bookingService.confirm({ reserveId: 'non-existent', customer: {} }),
            ).rejects.toThrow('Reservation not found')
        })

        it('deve lançar erro ao tentar confirmar reserva expirada', async () => {
            const reserveId = 'reserve-1'
            bookingRepositoryMock.findById.mockResolvedValue({
                id: reserveId,
                movieId: 'movie-1',
                status: BookingStatus.WAITING,
                expiresAt: new Date(Date.now() - 60000), // Expirou há 1 minuto
            } as any)

            const customer = { name: 'John Doe', email: 'john@test.com', phone: '123456789' }
            await expect(bookingService.confirm({ reserveId, customer })).rejects.toThrow(
                'Reservation expired or already processed',
            )
        })
    })

    describe('returnMovie', () => {
        it('deve retornar um filme alugado', async () => {
            const scheduleId = 'schedule-1'
            const movieId = 'movie-1'
            const customer = { name: 'John Doe', email: 'john@test.com', phone: '123456789' }

            bookingRepositoryMock.findByScheduleId.mockResolvedValue({
                id: 'booking-1',
                movieId,
                scheduleId,
                status: BookingStatus.LEASED,
                customer,
                expiresAt: new Date(),
            } as any)

            const result = await bookingService.returnMovie(scheduleId)

            expect(result.status).toBe(BookingStatus.RETURNED)
            expect(result.scheduleId).toBe(scheduleId)
            expect(bookingRepositoryMock.save).toHaveBeenCalled()
            expect(movieRepositoryMock.update).toHaveBeenCalledWith(movieId, { available: true })
        })

        it('deve lançar erro ao tentar retornar filme não encontrado', async () => {
            bookingRepositoryMock.findByScheduleId.mockResolvedValue(null)

            await expect(bookingService.returnMovie('non-existent')).rejects.toThrow(
                'Rental record not found',
            )
        })

        it('deve lançar erro ao tentar retornar filme que já foi devolvido', async () => {
            const scheduleId = 'schedule-1'
            bookingRepositoryMock.findByScheduleId.mockResolvedValue({
                id: 'booking-1',
                movieId: 'movie-1',
                scheduleId,
                status: BookingStatus.RETURNED,
                expiresAt: new Date(),
            } as any)

            await expect(bookingService.returnMovie(scheduleId)).rejects.toThrow(
                'This movie has already been returned or is not leased',
            )
        })
    })
})
