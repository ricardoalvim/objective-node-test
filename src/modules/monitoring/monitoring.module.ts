import { Router, Request, Response, NextFunction } from 'express'
import { Db } from 'mongodb'
import { makeMonitoringController } from './monitoring.factory'

export class MonitoringModule {
    static setup(db: Db): Router {
        const router = Router()
        const controller = makeMonitoringController(db)

        const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res)).catch(next)
        }

        router.get(
            '/monitoring/status',
            asyncHandler(async (req: Request, res: Response) => {
                const result = await controller.getStatus()
                res.status(200).json(result)
            }),
        )

        return router
    }
}
