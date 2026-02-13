import request from 'supertest'
import express, { Express } from 'express'
import { MongoClient, Db } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { CatalogModule } from '@modules/catalog/catalog.module'

describe('Catalog Integration (E2E)', () => {
  let mongoServer: MongoMemoryServer
  let connection: MongoClient
  let db: Db
  let app: Express

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()

    connection = await MongoClient.connect(uri)
    db = connection.db('test_db')

    app = express()
    app.use(express.json())
    app.use('/api', CatalogModule.setup(db))
  }, 30000)

  afterAll(async () => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 500))
    if (connection) await connection.close()
    if (mongoServer) await mongoServer.stop()
  })

  it('deve cadastrar um filme e listá-lo via API (Requisito: Listar Filmes)', async () => {
    const moviePayload = {
      name: 'Inception',
      synopsis: 'Dreams within dreams',
      rating: '9.0',
    }

    const postRes = await request(app).post('/api/movies').send(moviePayload)
    expect(postRes.status).toBe(201)
    expect(postRes.body).toHaveProperty('id')

    const getRes = await request(app).get('/api/all')
    expect(getRes.status).toBe(200)
    expect(Array.isArray(getRes.body)).toBe(true)
    expect(getRes.body.some((m: { name: string }) => m.name === 'Inception')).toBe(true)
  })

  it('deve atualizar um filme via API', async () => {
    const movie = await request(app)
      .post('/api/movies')
      .send({ name: 'Original', synopsis: '...', rating: '5' })
    const movieId = movie.body.id

    const updateRes = await request(app).put(`/api/movies/${movieId}`).send({ name: 'Updated' })

    expect(updateRes.status).toBe(200)
  })

  it('deve deletar um filme via API', async () => {
    const movie = await request(app)
      .post('/api/movies')
      .send({ name: 'To Delete', synopsis: '...', rating: '1' })
    const deleteRes = await request(app).delete(`/api/movies/${movie.body.id}`)

    expect(deleteRes.status).toBe(204)
  })
})
