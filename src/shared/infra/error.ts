import { ErrorCode } from '../enum/error-code.enum'
import { HttpStatus } from '../enum/http-status.enum'

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: HttpStatus

  constructor(code: ErrorCode, message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message)
    this.code = code
    this.statusCode = statusCode
    this.name = 'AppError'

    Object.setPrototypeOf(this, AppError.prototype)
  }
}
