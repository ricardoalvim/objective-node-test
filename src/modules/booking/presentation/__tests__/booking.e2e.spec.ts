import request from 'supertest'
import express, { Express } from 'express'
import { MongoClient, Db } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { BookingModule } from '@modules/booking/booking.module'
import { CatalogModule } from '@modules/catalog/catalog.module'
import { BookingStatus } from '@shared/enum/booking-status.enum'
import { errorHandler } from '@shared/infra/error-handler.middleware'

describe('Booking E2E (Integration)', () => {
    let mongoServer: MongoMemoryServer
    let connection: MongoClient
    let db: Db
    let app: Express
    let movieId: string

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create()
        const uri = mongoServer.getUri()

        connection = await MongoClient.connect(uri)
        db = connection.db('test_booking_db')

        app = express()
        app.use(express.json())
        app.use('/api', CatalogModule.setup(db))
        app.use('/api', BookingModule.setup(db))
        app.use(errorHandler)
    })

    beforeEach(async () => {
        const uniqueName = `Test Movie ${Date.now()}-${Math.random()}`
        const movieRes = await request(app)
            .post('/api/movies')
            .send({
                name: uniqueName,
                synopsis: 'A test movie for booking',
                rating: '8.0',
            })
        movieId = movieRes.body.id
    })

    afterAll(async () => {
        await connection.close()
        await mongoServer.stop()
    })

    describe('POST /api/book - Reservar Filme', () => {
        it('deve reservar um filme disponível com sucesso', async () => {
            const res = await request(app)
                .post('/api/book')
                .send({ movieId })

            expect(res.status).toBe(201)
            expect(res.body).toHaveProperty('reserveId')
            expect(res.body.status).toBe(BookingStatus.WAITING)
        })

        it('deve retornar 400 ao tentar reservar filme inválido', async () => {
            const res = await request(app)
                .post('/api/book')
                .send({ movieId: 'invalid-id' })

            expect(res.status).toBe(400)
            expect(res.body).toHaveProperty('error')
            expect(res.body).toHaveProperty('code')
        })

        it('deve tornar o filme indisponível na listagem após reserva', async () => {
            let listRes = await request(app).get('/api/all')
            const initialCount = listRes.body.length

            await request(app)
                .post('/api/book')
                .send({ movieId })

            listRes = await request(app).get('/api/all')
            expect(listRes.body.length).toBe(initialCount - 1)
            expect(listRes.body.some((m: { id: string }) => m.id === movieId)).toBe(false)
        })

        it('deve retornar 400 ao tentar reservar filme já reservado', async () => {
            await request(app)
                .post('/api/book')
                .send({ movieId })

            const res = await request(app)
                .post('/api/book')
                .send({ movieId })

            expect(res.status).toBe(400)
            expect(res.body.error).toBe('Movie not available for booking')
        })
    })

    describe('POST /api/confirm - Confirmar Locação', () => {
        it('deve confirmar uma reserva ativa', async () => {
            const bookRes = await request(app)
                .post('/api/book')
                .send({ movieId })
            const reserveId = bookRes.body.reserveId

            const customer = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '11999999999',
            }
            const res = await request(app)
                .post('/api/confirm')
                .send({ reserveId, customer })

            expect(res.status).toBe(200)
            expect(res.body).toHaveProperty('scheduleId')
            expect(res.body.status).toBe(BookingStatus.LEASED)
        })

        it('deve retornar 404 ao confirmar reserva inexistente', async () => {
            const customer = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '11999999999',
            }
            const res = await request(app)
                .post('/api/confirm')
                .send({ reserveId: 'non-existent', customer })

            expect(res.status).toBe(404)
            expect(res.body.error).toBe('Reservation not found')
        })
    })

    describe('POST /api/return - Devolver Filme', () => {
        it('deve retornar um filme alugado com sucesso', async () => {
            const bookRes = await request(app)
                .post('/api/book')
                .send({ movieId })
            const reserveId = bookRes.body.reserveId

            const customer = {
                name: 'Jane Doe',
                email: 'jane@example.com',
                phone: '11888888888',
            }
            const confirmRes = await request(app)
                .post('/api/confirm')
                .send({ reserveId, customer })
            const scheduleId = confirmRes.body.scheduleId

            const returnRes = await request(app)
                .post('/api/return')
                .send({ scheduleId })

            expect(returnRes.status).toBe(200)
            expect(returnRes.body.status).toBe(BookingStatus.RETURNED)
        })

        it('deve retornar 404 ao tentar retornar filme não alugado', async () => {
            const res = await request(app)
                .post('/api/return')
                .send({ scheduleId: 'non-existent' })

            expect(res.status).toBe(404)
            expect(res.body.error).toBe('Rental record not found')
        })

        it('deve tornar o filme disponível novamente após devolução', async () => {
            const bookRes = await request(app)
                .post('/api/book')
                .send({ movieId })
            const reserveId = bookRes.body.reserveId

            const customer = {
                name: 'Test User',
                email: 'test@example.com',
                phone: '11777777777',
            }
            const confirmRes = await request(app)
                .post('/api/confirm')
                .send({ reserveId, customer })
            const scheduleId = confirmRes.body.scheduleId

            let listRes = await request(app).get('/api/all')
            expect(listRes.body.some((m: { id: string }) => m.id === movieId)).toBe(false)

            await request(app)
                .post('/api/return')
                .send({ scheduleId })

            listRes = await request(app).get('/api/all')
            expect(listRes.body.some((m: { id: string }) => m.id === movieId)).toBe(true)
        })
    })

    describe('Fluxo Completo - Reserva → Confirmação → Devolução', () => {
        it('deve executar o fluxo completo de uma locação', async () => {
            let listRes = await request(app).get('/api/all')
            const initialCount = listRes.body.length
            expect(initialCount).toBeGreaterThan(0)

            const bookRes = await request(app)
                .post('/api/book')
                .send({ movieId })
            expect(bookRes.status).toBe(201)
            const reserveId = bookRes.body.reserveId

            listRes = await request(app).get('/api/all')
            expect(listRes.body.length).toBe(initialCount - 1)

            const customer = {
                name: 'Complete Flow',
                email: 'flow@example.com',
                phone: '11666666666',
            }
            const confirmRes = await request(app)
                .post('/api/confirm')
                .send({ reserveId, customer })
            expect(confirmRes.status).toBe(200)
            const scheduleId = confirmRes.body.scheduleId

            const returnRes = await request(app)
                .post('/api/return')
                .send({ scheduleId })
            expect(returnRes.status).toBe(200)

            listRes = await request(app).get('/api/all')
            expect(listRes.body.length).toBe(initialCount)
        })
    })

    describe('Validações e Erros', () => {
        it('deve retornar 409 ao tentar devolver filme já devolvido', async () => {
            const bookRes = await request(app)
                .post('/api/book')
                .send({ movieId })
            const reserveId = bookRes.body.reserveId

            const customer = {
                name: 'Double Return',
                email: 'double@example.com',
                phone: '11555555555',
            }
            const confirmRes = await request(app)
                .post('/api/confirm')
                .send({ reserveId, customer })
            const scheduleId = confirmRes.body.scheduleId

            await request(app)
                .post('/api/return')
                .send({ scheduleId })

            const res = await request(app)
                .post('/api/return')
                .send({ scheduleId })

            expect(res.status).toBe(409)
            expect(res.body.error).toBe('This movie has already been returned or is not leased')
        })
    })
})
