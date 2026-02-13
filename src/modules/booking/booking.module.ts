import { Router, Request, Response, NextFunction } from 'express'
import { Db } from 'mongodb'
import { makeBookingController } from './booking.factory'

export class BookingModule {
  static setup(db: Db): Router {
    const router = Router()
    const controller = makeBookingController(db)

    const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res)).catch(next)
    }

    // POST /book - Reservar filme
    router.post(
      '/book',
      asyncHandler(async (req: Request, res: Response) => {
        const result = await controller.reserve(req.body)
        res.status(201).json(result)
      }),
    )

    // POST /confirm - Confirmar locação
    router.post(
      '/confirm',
      asyncHandler(async (req: Request, res: Response) => {
        const result = await controller.confirm(req.body)
        res.status(200).json(result)
      }),
    )

    // POST /return - Devolver filme
    router.post(
      '/return',
      asyncHandler(async (req: Request, res: Response) => {
        const result = await controller.returnMovie(req.body)
        res.status(200).json(result)
      }),
    )

    return router
  }
}
