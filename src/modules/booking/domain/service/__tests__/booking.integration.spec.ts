import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongoClient, Db } from 'mongodb'
import { MovieRepository } from '@modules/catalog/repository/catalog.repository'
import { CatalogService } from '@modules/catalog/domain/service/catalog.service'
import { Booking } from '../../entity/booking.entity'
import { BookingRepository } from '@modules/booking/repository/booking.repository'
import { BookingService } from '../booking.service'
import { BookingStatus } from '@shared/enum/booking-status.enum'

describe('Booking Integration Tests', () => {
    let mongoServer: MongoMemoryServer
    let mongoClient: MongoClient
    let db: Db
    let bookingService: BookingService
    let catalogService: CatalogService
    let movieRepository: MovieRepository
    let bookingRepository: BookingRepository

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        mongoClient = new MongoClient(mongoServer.getUri())
        await mongoClient.connect()
        db = mongoClient.db('test_objective_rental')
    })

    afterAll(async () => {
        await mongoClient.close()
        await mongoServer.stop()
    })

    beforeEach(async () => {
        await db.collection('movies').deleteMany({})
        await db.collection('bookings').deleteMany({})

        movieRepository = new MovieRepository(db)
        bookingRepository = new BookingRepository(db)
        catalogService = new CatalogService(movieRepository, bookingRepository)
        bookingService = new BookingService(bookingRepository, movieRepository)
    })

    it('deve executar o fluxo completo de reserva, confirmação e devolução', async () => {
        const movieData = {
            name: 'The Matrix',
            synopsis: 'A sci-fi masterpiece',
            rating: '5',
        }
        const createdMovie = await catalogService.create(movieData)
        const movieId = createdMovie.id

        let availableMovies = await catalogService.listAvailable()
        expect(availableMovies).toHaveLength(1)
        expect(availableMovies[0].available).toBe(true)

        const reserveResult = await bookingService.reserve(movieId)
        expect(reserveResult.status).toBe(BookingStatus.WAITING)
        const reserveId = reserveResult.reserveId

        availableMovies = await catalogService.listAvailable()
        expect(availableMovies).toHaveLength(0)

        const customer = { name: 'Rick', email: 'rick@example.com', phone: '123456789' }
        const confirmResult = await bookingService.confirm({ reserveId, customer })
        expect(confirmResult.status).toBe(BookingStatus.LEASED)
        const scheduleId = confirmResult.scheduleId

        const returnResult = await bookingService.returnMovie(scheduleId)
        expect(returnResult.status).toBe(BookingStatus.RETURNED)

        availableMovies = await catalogService.listAvailable()
        expect(availableMovies).toHaveLength(1)
        expect(availableMovies[0].available).toBe(true)
    })

    it('não deve permitir reservar um filme já reservado', async () => {
        const movieData = {
            name: 'Inception',
            synopsis: 'A mind-bending thriller',
            rating: '4.5',
        }
        const createdMovie = await catalogService.create(movieData)
        const movieId = createdMovie.id

        await bookingService.reserve(movieId)

        await expect(bookingService.reserve(movieId)).rejects.toThrow('Movie not available for booking')
    })

    it('não deve permitir confirmar uma reserva expirada', async () => {
        const movieData = {
            name: 'Interstellar',
            synopsis: 'A cosmic journey',
            rating: '4.8',
        }
        const createdMovie = await catalogService.create(movieData)
        const movieId = createdMovie.id

        const booking = new Booking(movieId)
        booking.expiresAt = new Date(Date.now() - 60000)
        await bookingRepository.save(booking)

        const customer = { name: 'Jane Doe', email: 'jane@example.com', phone: '987654321' }
        await expect(bookingService.confirm({ reserveId: booking.id, customer })).rejects.toThrow(
            'Reservation expired or already processed',
        )
    })

    it('deve lançar erro ao tentar retornar um filme sem aluguel ativo', async () => {
        await expect(bookingService.returnMovie('non-existent-schedule')).rejects.toThrow(
            'Rental record not found',
        )
    })
})
