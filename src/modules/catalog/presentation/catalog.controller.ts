import { Request } from 'express'
import { BaseController } from '@shared/infra/presentation/base.controller'
import { HttpResponse } from '@shared/infra/presentation/protocols/http'
import { CatalogService } from '../domain/service/catalog.service'

export class CatalogController extends BaseController {
    constructor(private readonly catalogService: CatalogService) {
        super()
    }

    /**
     * @openapi
     * /api/all:
     * get:
     * summary: Lista todos os filmes disponíveis
     * tags: [Catalog]
     * responses:
     * 200:
     * description: Sucesso
     * content:
     * application/json:
     * schema:
     * type: array
     * items:
     * $ref: '#/components/schemas/Movie'
     */
    public async getAll(_req: Request): Promise<HttpResponse> {
        const movies = await this.catalogService.listAvailable()
        return { statusCode: 200, data: movies }
    }

    /**
     * @openapi
     * /api/movies/{id}:
     * get:
     * summary: Detalhes de um filme específico
     * tags: [Catalog]
     * parameters:
     * - in: path
     * name: id
     * required: true
     * schema:
     * type: string
     * responses:
     * 200:
     * description: Dados do filme
     * 404:
     * description: Filme não encontrado
     */
    public async getById(req: Request): Promise<HttpResponse> {
        const { id } = req.params
        const movie = await this.catalogService.getMovieDetails(id)

        if (!movie) {
            return { statusCode: 404, error: 'Movie not found' }
        }

        return { statusCode: 200, data: movie }
    }

    protected async executeImpl(req: Request): Promise<HttpResponse> {
        return this.getAll(req)
    }
}