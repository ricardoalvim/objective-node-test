import { ErrorCode } from '../enum/error-code.enum'
import { HttpStatus } from '../enum/http-status.enum'
import { ErrorMessages } from '../enum/error-messages.enum'
import { AppError } from './error'

/**
 * Factory para criar AppError com mensagens centralizadas
 */
export class ErrorFactory {
  static create(
    code: ErrorCode,
    customMessage?: string,
    statusCode?: HttpStatus
  ): AppError {
    const errorConfig = ErrorMessages[code]
    const message = customMessage || errorConfig.message
    const status = statusCode || errorConfig.defaultStatusCode

    return new AppError(code, message, status)
  }
}
