import { MonitoringService } from '../monitoring.service'
import { BookingStatus } from '@shared/enum/booking-status.enum'

describe('MonitoringService', () => {
    let monitoringService: MonitoringService
    let mockMovieRepository: any
    let mockBookingRepository: any

    beforeEach(() => {
        mockMovieRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
        }

        mockBookingRepository = {
            findAll: jest.fn(),
        }

        monitoringService = new MonitoringService(mockMovieRepository, mockBookingRepository)
    })

    describe('getStatus', () => {
        it('should return system status with all metrics', async () => {
            const movies = [
                { id: '1', name: 'Movie 1', available: true },
                { id: '2', name: 'Movie 2', available: true },
                { id: '3', name: 'Movie 3', available: false },
            ]

            const bookings = [
                {
                    id: 'b1',
                    movieId: '3',
                    status: BookingStatus.WAITING,
                    expiresAt: new Date(Date.now() + 3600000),
                },
                {
                    id: 'b2',
                    movieId: '2',
                    status: BookingStatus.LEASED,
                    customer: { name: 'John', email: 'john@test.com', phone: '123' },
                },
                {
                    id: 'b3',
                    movieId: '1',
                    status: BookingStatus.RETURNED,
                    customer: { name: 'Jane', email: 'jane@test.com', phone: '456' },
                },
            ]

            mockMovieRepository.findAll.mockResolvedValue(movies)
            mockBookingRepository.findAll.mockResolvedValue(bookings)

            const result = await monitoringService.getStatus()

            expect(result.movies.total).toBe(3)
            expect(result.movies.available).toBe(2)
            expect(result.movies.reserved).toBe(1)
            expect(result.movies.leased).toBe(1)
            expect(result.bookings.activeReservations).toBe(1)
            expect(result.bookings.activeLeases).toBe(1)
            expect(result.bookings.totalReturns).toBe(1)
        })

        it('should calculate utilization rate correctly', async () => {
            mockMovieRepository.findAll.mockResolvedValue([
                { id: '1', name: 'Movie 1', available: false },
                { id: '2', name: 'Movie 2', available: false },
                { id: '3', name: 'Movie 3', available: true },
                { id: '4', name: 'Movie 4', available: true },
            ])

            mockBookingRepository.findAll.mockResolvedValue([
                { id: 'b1', movieId: '1', status: BookingStatus.LEASED },
                { id: 'b2', movieId: '2', status: BookingStatus.LEASED },
            ])

            const result = await monitoringService.getStatus()

            expect(result.statistics.utilizationRate).toBe('50%')
        })

        it('should return 0% utilization when no movies', async () => {
            mockMovieRepository.findAll.mockResolvedValue([])
            mockBookingRepository.findAll.mockResolvedValue([])

            const result = await monitoringService.getStatus()

            expect(result.statistics.utilizationRate).toBe('0%')
        })
    })

    describe('getMostRentedMovie', () => {
        it('should return the most rented movie', async () => {
            mockMovieRepository.findAll.mockResolvedValue([
                { id: '1', name: 'Movie 1', available: true },
            ])

            mockBookingRepository.findAll.mockResolvedValue([
                { movieId: '1', status: BookingStatus.RETURNED },
                { movieId: '1', status: BookingStatus.RETURNED },
                { movieId: '2', status: BookingStatus.RETURNED },
            ])

            mockMovieRepository.findById.mockResolvedValue({
                id: '1',
                name: 'Most Rented',
            })

            const result = await monitoringService.getStatus()

            expect(result.statistics.mostRentedMovie).toBeDefined()
            expect(result.statistics.mostRentedMovie?.id).toBe('1')
            expect(result.statistics.mostRentedMovie?.rentalCount).toBe(2)
        })

        it('should return undefined when no movies returned', async () => {
            mockMovieRepository.findAll.mockResolvedValue([])
            mockBookingRepository.findAll.mockResolvedValue([
                { movieId: '1', status: BookingStatus.WAITING },
                { movieId: '2', status: BookingStatus.LEASED },
            ])

            const result = await monitoringService.getStatus()

            expect(result.statistics.mostRentedMovie).toBeUndefined()
        })
    })

    describe('getTopCustomers', () => {
        it('should return top customers', async () => {
            mockMovieRepository.findAll.mockResolvedValue([])
            mockBookingRepository.findAll.mockResolvedValue([
                {
                    movieId: '1',
                    status: BookingStatus.RETURNED,
                    customer: { name: 'Alice', email: 'alice@test.com', phone: '111' },
                },
                {
                    movieId: '1',
                    status: BookingStatus.RETURNED,
                    customer: { name: 'Alice', email: 'alice@test.com', phone: '111' },
                },
                {
                    movieId: '2',
                    status: BookingStatus.RETURNED,
                    customer: { name: 'Bob', email: 'bob@test.com', phone: '222' },
                },
            ])

            const result = await monitoringService.getStatus()

            expect(result.statistics.topCustomers.length).toBeGreaterThanOrEqual(1)
            expect(result.statistics.topCustomers[0].name).toBe('Alice')
            expect(result.statistics.topCustomers[0].rentalCount).toBe(2)
        })

        it('should limit top customers to 5', async () => {
            const bookings = Array.from({ length: 10 }, (_, i) => ({
                movieId: `${i}`,
                status: BookingStatus.RETURNED,
                customer: {
                    name: `Customer ${i}`,
                    email: `customer${i}@test.com`,
                    phone: `${i}`,
                },
            }))

            mockMovieRepository.findAll.mockResolvedValue([])
            mockBookingRepository.findAll.mockResolvedValue(bookings)

            const result = await monitoringService.getStatus()

            expect(result.statistics.topCustomers.length).toBeLessThanOrEqual(5)
        })
    })

    describe('expired reservations', () => {
        it('should count expired reservations correctly', async () => {
            mockMovieRepository.findAll.mockResolvedValue([])
            mockBookingRepository.findAll.mockResolvedValue([
                {
                    id: 'b1',
                    movieId: '1',
                    status: BookingStatus.WAITING,
                    expiresAt: new Date(Date.now() - 3600000),
                },
                {
                    id: 'b2',
                    movieId: '2',
                    status: BookingStatus.WAITING,
                    expiresAt: new Date(Date.now() + 3600000),
                },
            ])

            const result = await monitoringService.getStatus()

            expect(result.bookings.expiredReservations).toBe(1)
            expect(result.bookings.activeReservations).toBe(1)
        })
    })
})
