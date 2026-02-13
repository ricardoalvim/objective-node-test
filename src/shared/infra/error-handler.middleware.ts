import { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { AppError } from './error'
import { HttpStatus } from '../enum/http-status.enum'
import { ErrorCode } from '../enum/error-code.enum'

export const errorHandler: ErrorRequestHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.error('[ERROR]', {
        message: err.message,
        code: 'code' in err ? err.code : 'UNKNOWN',
        stack: err.stack,
    })

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code,
        })
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error',
        code: ErrorCode.INTERNAL_SERVER_ERROR,
    })
}
