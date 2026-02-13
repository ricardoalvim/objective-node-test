import { BookingStatus } from '@shared/enum/booking-status.enum'

export interface ReserveMovieRequest {
  movieId: string
}

export interface ConfirmBookingRequest {
  reserveId: string
  customer: {
    name: string
    email: string
    phone: string
  }
}

export interface ReturnMovieRequest {
  scheduleId: string
}

export interface ReserveMovieResponse {
  reserveId: string
  status: BookingStatus.WAITING
}

export interface ConfirmBookingResponse {
  scheduleId: string
  status: BookingStatus.LEASED
}

export interface ReturnMovieResponse {
  scheduleId: string
  status: BookingStatus.RETURNED
}

