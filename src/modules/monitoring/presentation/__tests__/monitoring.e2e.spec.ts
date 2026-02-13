import request from 'supertest'
import express, { Express } from 'express'
import { MongoClient, Db } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { CatalogModule } from '@modules/catalog/catalog.module'
import { BookingModule } from '@modules/booking/booking.module'
import { MonitoringModule } from '@modules/monitoring/monitoring.module'
import { errorHandler } from '@shared/infra/error-handler.middleware'

describe('Monitoring E2E', () => {
    let mongoServer: MongoMemoryServer
    let connection: MongoClient
    let db: Db
    let app: Express

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()

        connection = await MongoClient.connect(uri)
        db = connection.db('test_monitoring_db')

        app = express()
        app.use(express.json())
        app.use('/api', CatalogModule.setup(db))
        app.use('/api', BookingModule.setup(db))
        app.use('/api', MonitoringModule.setup(db))
        app.use(errorHandler)
    })

    afterAll(async () => {
        await connection.close()
        await mongoServer.stop()
    })

    describe('GET /api/monitoring/status', () => {
        it('should return system status', async () => {
            const res = await request(app).get('/api/monitoring/status')

            expect(res.status).toBe(200)
            expect(res.body.movies).toBeDefined()
            expect(res.body.movies.total).toBeGreaterThanOrEqual(0)
            expect(res.body.movies.available).toBeLessThanOrEqual(res.body.movies.total)
            expect(res.body.bookings).toBeDefined()
            expect(res.body.statistics).toBeDefined()
            expect(res.body.statistics.utilizationRate).toBeDefined()
            expect(Array.isArray(res.body.statistics.topCustomers)).toBe(true)
        })

        it('should track reservations and leases', async () => {
            // Create a movie
            const movieRes = await request(app)
                .post('/api/movies')
                .send({
                    name: `Monitoring Test ${Date.now()}`,
                    synopsis: 'Test movie',
                    rating: '8.0',
                })

            const initialStatus = await request(app).get('/api/monitoring/status')
            const initialReserved = initialStatus.body.movies.reserved || 0

            // Reserve the movie
            const reserveRes = await request(app)
                .post('/api/book')
                .send({ movieId: movieRes.body.id })

            const afterReserveStatus = await request(app).get('/api/monitoring/status')
            expect(afterReserveStatus.body.movies.reserved).toBe(initialReserved + 1)

            // Confirm the reservation
            const confirmRes = await request(app)
                .post('/api/confirm')
                .send({
                    reserveId: reserveRes.body.reserveId,
                    customer: {
                        name: 'Test User',
                        email: 'test@example.com',
                        phone: '123456789',
                    },
                })

            const afterConfirmStatus = await request(app).get('/api/monitoring/status')
            expect(afterConfirmStatus.body.movies.leased).toBe(1)
            expect(afterConfirmStatus.body.bookings.activeLeases).toBe(1)

            // Return the movie
            await request(app)
                .post('/api/return')
                .send({ scheduleId: confirmRes.body.scheduleId })

            const afterReturnStatus = await request(app).get('/api/monitoring/status')
            expect(afterReturnStatus.body.bookings.totalReturns).toBe(1)
        })

        it('should identify most rented movie', async () => {
            // Create one movie and rent it twice
            const movieRes = await request(app)
                .post('/api/movies')
                .send({
                    name: `Most Rented ${Date.now()}`,
                    synopsis: 'Test movie',
                    rating: '8.0',
                })

            for (let i = 0; i < 2; i++) {
                const bookRes = await request(app)
                    .post('/api/book')
                    .send({ movieId: movieRes.body.id })

                const confirmRes = await request(app)
                    .post('/api/confirm')
                    .send({
                        reserveId: bookRes.body.reserveId,
                        customer: {
                            name: `User ${i}`,
                            email: `user${i}@example.com`,
                            phone: '123',
                        },
                    })

                await request(app)
                    .post('/api/return')
                    .send({ scheduleId: confirmRes.body.scheduleId })
            }

            const status = await request(app).get('/api/monitoring/status')

            expect(status.body.statistics.mostRentedMovie).toBeDefined()
            expect(status.body.statistics.mostRentedMovie.rentalCount).toBeGreaterThanOrEqual(2)
        })

        it('should calculate utilization rate', async () => {
            const status = await request(app).get('/api/monitoring/status')

            const utilizationRate = status.body.statistics.utilizationRate
            expect(utilizationRate).toMatch(/\d+%/)

            // Parse percentage and validate
            const percentage = parseInt(utilizationRate)
            expect(percentage).toBeGreaterThanOrEqual(0)
            expect(percentage).toBeLessThanOrEqual(100)
        })
    })
})
