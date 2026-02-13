import { CatalogController } from '../catalog.controller'
import { CatalogService } from '../../domain/service/catalog.service'
import { MovieRepositoryDTO } from '../../repository/dto/movie.repository.dto'

describe('CatalogController', () => {
  let sut: CatalogController
  let serviceMock: jest.Mocked<CatalogService>

  beforeEach(() => {
    serviceMock = {
      listAvailable: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getMovieDetails: jest.fn(),
    } as any

    sut = new CatalogController(serviceMock)
  })

  it('deve retornar 200 ao listar filmes', async () => {
    const movies: MovieRepositoryDTO[] = [{ id: '1', name: 'Movie 1', synopsis: 'Desc', rating: '5' }]
    serviceMock.listAvailable.mockResolvedValue(movies)

    const result = await sut.getAll()

    expect(result).toEqual(movies)
    expect(serviceMock.listAvailable).toHaveBeenCalled()
  })

  it('deve retornar 201 ao criar um filme', async () => {
    const payload = { name: 'New Movie', synopsis: 'Desc', rating: '5' }
    const response: MovieRepositoryDTO = { id: 'new-id', ...payload }
    serviceMock.create.mockResolvedValue(response)

    const result = await sut.create(payload)

    expect(result.id).toBe('new-id')
    expect(serviceMock.create).toHaveBeenCalledWith(payload)
  })
})
