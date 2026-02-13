import { MonitoringController } from '../monitoring.controller'
import { MonitoringService } from '../../domain/service/monitoring.service'
import { BookingStatus } from '@shared/enum/booking-status.enum'

describe('MonitoringController', () => {
    let monitoringController: MonitoringController
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
        monitoringController = new MonitoringController(monitoringService)
    })

    describe('getStatus', () => {
        it('should return system status', async () => {
            mockMovieRepository.findAll.mockResolvedValue([
                { id: '1', name: 'Movie 1', available: true },
                { id: '2', name: 'Movie 2', available: false },
            ])

            mockBookingRepository.findAll.mockResolvedValue([
                {
                    id: 'b1',
                    movieId: '2',
                    status: BookingStatus.LEASED,
                },
            ])

            const result = await monitoringController.getStatus()

            expect(result.movies.total).toBe(2)
            expect(result.movies.available).toBe(1)
            expect(result.movies.leased).toBe(1)
            expect(result.statistics).toBeDefined()
        })
    })
})
