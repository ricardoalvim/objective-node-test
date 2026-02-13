import { BookingController } from '../booking.controller'
import { BookingService } from '../../domain/service/booking.service'
import { BookingStatus } from '@shared/enum/booking-status.enum'

describe('BookingController', () => {
    let controller: BookingController
    let bookingServiceMock: jest.Mocked<BookingService>

    beforeEach(() => {
        bookingServiceMock = {
            reserve: jest.fn(),
            confirm: jest.fn(),
            returnMovie: jest.fn(),
        } as any

        controller = new BookingController(bookingServiceMock)
    })

    describe('reserve', () => {
        it('deve retornar 201 e reservar um filme', async () => {
            const movieId = 'movie-1'
            const expectedResponse = { reserveId: 'reserve-1', status: BookingStatus.WAITING }
            bookingServiceMock.reserve.mockResolvedValue(expectedResponse)

            const result = await controller.reserve({ movieId })

            expect(result).toEqual(expectedResponse)
            expect(bookingServiceMock.reserve).toHaveBeenCalledWith(movieId)
            expect(controller.getStatus()).toBe(201)
        })
    })

    describe('confirm', () => {
        it('deve confirmar uma reserva', async () => {
            const reserveId = 'reserve-1'
            const customer = { name: 'John Doe', email: 'john@test.com', phone: '123456789' }
            const payload = { reserveId, customer }
            const expectedResponse = { scheduleId: 'schedule-1', status: BookingStatus.LEASED }

            bookingServiceMock.confirm.mockResolvedValue(expectedResponse)

            const result = await controller.confirm(payload)

            expect(result).toEqual(expectedResponse)
            expect(bookingServiceMock.confirm).toHaveBeenCalledWith(payload)
        })
    })

    describe('returnMovie', () => {
        it('deve retornar um filme', async () => {
            const scheduleId = 'schedule-1'
            const expectedResponse = { scheduleId, status: BookingStatus.RETURNED }

            bookingServiceMock.returnMovie.mockResolvedValue(expectedResponse)

            const result = await controller.returnMovie({ scheduleId })

            expect(result).toEqual(expectedResponse)
            expect(bookingServiceMock.returnMovie).toHaveBeenCalledWith(scheduleId)
        })
    })
})
