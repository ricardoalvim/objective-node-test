import { Router, Request, Response } from 'express'
import { Db } from 'mongodb'
import { seedCatalog } from './catalog.seed'
import { MovieRepository } from './repository/catalog.repository'
import { CatalogService } from './domain/service/catalog.service'
import { CatalogController } from './presentation/catalog.controller'

export class CatalogModule {
    static setup(db: Db): Router {
        const router = Router()

        seedCatalog(db).catch(err => console.error('Seed falhou', err))

        const repository = new MovieRepository(db)
        const service = new CatalogService(repository)
        const controller = new CatalogController(service)

        router.get('/all', (req: Request, res: Response) => {
            controller.execute(req, res)
        })

        router.get('/movies/:id', (req: Request, res: Response) => {
            controller.execute(req, res)
        })

        return router
    }
}