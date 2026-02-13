import { Logger } from '@shared/logger'
import { Request, Response } from 'express'
import { HttpResponse } from './protocols/http'

export abstract class BaseController {
    protected abstract executeImpl(req: Request): Promise<HttpResponse>

    public async execute(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.executeImpl(req)

            if (result.error) {
                Logger.warn(`[BaseController] Client Error: ${result.error}`)
                res.status(result.statusCode || 400).json({ error: result.error })
                return
            }

            res.status(result.statusCode || 200).json(result.data)
        } catch (error) {
            Logger.error('[BaseController] Uncaught Exception', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}