import { CatalogService } from '../catalog.service'
import { IMovieRepository } from '../../interfaces/catalog.repository.interface'

describe('CatalogService', () => {
  let sut: CatalogService
  let repositoryMock: jest.Mocked<IMovieRepository>

  beforeEach(() => {
    repositoryMock = {
      findAvailable: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any

    sut = new CatalogService(repositoryMock)
  })

  it('deve listar apenas filmes disponíveis (Regra do Desafio)', async () => {
    const fakeMovies = [
      { id: '1', name: 'Matrix', synopsis: 'Any', rating: '5', available: true },
    ] as any

    repositoryMock.findAvailable.mockResolvedValue(fakeMovies)

    const result = await sut.listAvailable()

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Matrix')
    expect(repositoryMock.findAvailable).toHaveBeenCalledTimes(1)
  })

  it('deve retornar null se o filme não for encontrado no detalhe', async () => {
    repositoryMock.findById.mockResolvedValue(null)
    const result = await sut.getMovieDetails('any_id')
    expect(result).toBeNull()
  })

  it('deve chamar o update do repositório', async () => {
    await sut.update('any-id', { name: 'Updated Name' })
    expect(repositoryMock.update).toHaveBeenCalledWith('any-id', { name: 'Updated Name' })
  })

  it('deve chamar o delete do repositório', async () => {
    await sut.delete('any-id')
    expect(repositoryMock.delete).toHaveBeenCalledWith('any-id')
  })

  it('deve retornar undefined ao tentar atualizar filme inexistente', async () => {
    repositoryMock.findById.mockResolvedValue(null)

    const result = await sut.update('id-fake', {})

    expect(result).toBeUndefined()
  })
})
