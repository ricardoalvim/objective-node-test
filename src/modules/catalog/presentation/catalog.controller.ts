import { Body, Controller, Delete, Get, Path, Post, Put, Route, SuccessResponse, Tags } from 'tsoa'
import { CatalogService } from '../domain/service/catalog.service'
import { MovieRepositoryDTO } from '../repository/dto/movie.repository.dto'
import { CreateMovieRequest, UpdateMovieRequest } from './dto/movie.controller.dto'

@Route('api')
@Tags('Catalog')
export class CatalogController extends Controller {
  constructor(private readonly catalogService: CatalogService) {
    super()
  }

  /**
   * Lista todos os filmes disponíveis para locação.
   * @summary Listar filmes disponíveis
   */
  @Get('/all')
  public async getAll(): Promise<MovieRepositoryDTO[]> {
    return this.catalogService.listAvailable()
  }

  /**
   * Adiciona um novo filme ao catálogo (Massa de dados).
   * @summary Adicionar filme
   */
  @SuccessResponse('201', 'Created') // Documenta o 201
  @Post('/movies')
  public async create(@Body() requestBody: CreateMovieRequest): Promise<MovieRepositoryDTO> {
    const movie = await this.catalogService.create(requestBody)
    this.setStatus(201)
    return movie
  }

  /**
   * Atualiza os dados de um filme existente.
   * @param id O UUID do filme
   */
  @Put('/movies/{id}')
  public async update(@Path() id: string, @Body() requestBody: UpdateMovieRequest): Promise<void> {
    await this.catalogService.update(id, requestBody)
    this.setStatus(200)
  }

  /**
   * Remove um filme do catálogo.
   * @param id O UUID do filme
   */
  @SuccessResponse('204', 'No Content')
  @Delete('/movies/{id}')
  public async delete(@Path() id: string): Promise<void> {
    await this.catalogService.delete(id)
    this.setStatus(204)
  }
}
