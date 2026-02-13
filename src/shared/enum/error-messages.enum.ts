import { ErrorCode } from './error-code.enum'
import { HttpStatus } from './http-status.enum'

interface ErrorMessage {
  message: string
  defaultStatusCode: HttpStatus
}

export const ErrorMessages: Record<ErrorCode, ErrorMessage> = {
  [ErrorCode.MOVIE_NOT_AVAILABLE_FOR_BOOKING]: {
    message: 'Movie not available for booking',
    defaultStatusCode: HttpStatus.BAD_REQUEST,
  },
  [ErrorCode.RESERVATION_NOT_FOUND]: {
    message: 'Reservation not found',
    defaultStatusCode: HttpStatus.NOT_FOUND,
  },
  [ErrorCode.RESERVATION_EXPIRED_OR_ALREADY_PROCESSED]: {
    message: 'Reservation expired or already processed',
    defaultStatusCode: HttpStatus.CONFLICT,
  },
  [ErrorCode.RENTAL_RECORD_NOT_FOUND]: {
    message: 'Rental record not found',
    defaultStatusCode: HttpStatus.NOT_FOUND,
  },
  [ErrorCode.MOVIE_ALREADY_RETURNED_OR_NOT_LEASED]: {
    message: 'This movie has already been returned or is not leased',
    defaultStatusCode: HttpStatus.CONFLICT,
  },
  [ErrorCode.INVALID_INPUT]: {
    message: 'Invalid input provided',
    defaultStatusCode: HttpStatus.BAD_REQUEST,
  },
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    message: 'Internal server error',
    defaultStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },
}
