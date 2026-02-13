import { Router, Request, Response, NextFunction } from 'express'
import { Db } from 'mongodb'
import { makeCatalogController } from './catalog.factory'
import { seedCatalog } from './catalog.seed'

export class CatalogModule {
  static setup(db: Db): Router {
    const router = Router()

    seedCatalog(db).catch(console.error)

    const controller = makeCatalogController(db)

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next)
    }

    // GET /all
    router.get(
      '/all',
      asyncHandler(async (_req: Request, res: Response) => {
        const result = await controller.getAll()
        res.json(result)
      }),
    )

    // POST /movies
    router.post(
      '/movies',
      asyncHandler(async (req: Request, res: Response) => {
        const result = await controller.create(req.body)
        res.status(201).json(result)
      }),
    )

    // PUT /movies/:id
    router.put(
      '/movies/:id',
      asyncHandler(async (req: Request, res: Response) => {
        await controller.update(req.params.id, req.body)
        res.status(200).send()
      }),
    )

    // DELETE /movies/:id
    router.delete(
      '/movies/:id',
      asyncHandler(async (req: Request, res: Response) => {
        await controller.delete(req.params.id)
        res.status(204).send()
      }),
    )

    return router
  }
}
