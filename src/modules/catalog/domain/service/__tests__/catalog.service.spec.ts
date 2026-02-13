import { CatalogService } from '../catalog.service'
import { IMovieRepository } from '../../interfaces/catalog.repository.interface'
import { IBookingRepository } from '@modules/booking/domain/interfaces/booking.repository.interface'
import { Movie } from '../../entity/movie.entity'
import { Booking } from '@modules/booking/domain/entity/booking.entity'

describe('CatalogService', () => {
  let sut: CatalogService
  let repositoryMock: jest.Mocked<IMovieRepository>
  let bookingRepositoryMock: jest.Mocked<IBookingRepository>

  beforeEach(() => {
    repositoryMock = {
      findAvailable: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any

    bookingRepositoryMock = {
      save: jest.fn(),
      findById: jest.fn(),
      findByScheduleId: jest.fn(),
      findExpiredWaiting: jest.fn(),
      delete: jest.fn(),
    } as any

    sut = new CatalogService(repositoryMock, bookingRepositoryMock)
  })

  it('deve listar apenas filmes disponíveis (Regra do Desafio)', async () => {
    const fakeMovies: Movie[] = [
      { id: '1', name: 'Matrix', synopsis: 'Science fiction classic', rating: '5', available: true },
    ]

    bookingRepositoryMock.findExpiredWaiting.mockResolvedValue([])
    repositoryMock.findAvailable.mockResolvedValue(fakeMovies)

    const result = await sut.listAvailable()

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Matrix')
    expect(repositoryMock.findAvailable).toHaveBeenCalledTimes(1)
  })

  it('deve retornar null se o filme não for encontrado no detalhe', async () => {
    repositoryMock.findById.mockResolvedValue(null)
    const result = await sut.getMovieDetails('test-id')
    expect(result).toBeNull()
  })

  it('deve chamar o update do repositório', async () => {
    const updatePayload = { name: 'Updated Name' }
    await sut.update('test-id', updatePayload)
    expect(repositoryMock.update).toHaveBeenCalledWith('test-id', updatePayload)
  })

  it('deve chamar o delete do repositório', async () => {
    await sut.delete('test-id')
    expect(repositoryMock.delete).toHaveBeenCalledWith('test-id')
  })

  it('deve retornar undefined ao tentar atualizar filme inexistente', async () => {
    repositoryMock.findById.mockResolvedValue(null)

    const result = await sut.update('id-fake', {})

    expect(result).toBeUndefined()
  })
})
