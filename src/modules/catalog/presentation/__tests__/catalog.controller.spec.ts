import { CatalogController } from '../catalog.controller'

describe('CatalogController', () => {
  let sut: CatalogController
  let serviceMock: any

  beforeEach(() => {
    serviceMock = {
      listAvailable: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    sut = new CatalogController(serviceMock)
  })

  it('deve retornar 200 ao listar filmes', async () => {
    const movies = [{ id: '1', name: 'Movie 1' }]
    serviceMock.listAvailable.mockResolvedValue(movies)

    const result = await sut.getAll()

    expect(result).toEqual(movies)
    expect(serviceMock.listAvailable).toHaveBeenCalled()
  })

  it('deve retornar 201 ao criar um filme', async () => {
    const payload = { name: 'New Movie', synopsis: 'Desc', rating: '5' }
    serviceMock.create.mockResolvedValue({ id: 'new-id', ...payload })

    const result = await sut.create(payload)

    expect(result.id).toBe('new-id')
    expect(serviceMock.create).toHaveBeenCalledWith(payload)
  })
})
