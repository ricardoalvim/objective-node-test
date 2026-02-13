import { randomUUID } from 'crypto'
import { BookingStatus } from '@shared/enum/booking-status.enum'

export class Booking {
  public readonly id: string
  public readonly movieId: string
  public readonly expiresAt: Date
  public status: BookingStatus
  public customer?: { name: string; email: string; phone: string }
  public scheduleId?: string

  constructor(movieId: string, id?: string, status?: BookingStatus, expiresAt?: Date) {
    this.id = id ?? randomUUID()
    this.movieId = movieId
    this.status = status ?? BookingStatus.WAITING
    this.expiresAt = expiresAt ?? new Date(Date.now() + 3 * 60 * 60 * 1000)
  }

  public isValidForConfirmation(): boolean {
    return this.status === BookingStatus.WAITING && new Date() < this.expiresAt
  }

  public markAsLeased(customer: { name: string; email: string; phone: string }): void {
    this.status = BookingStatus.LEASED
    this.customer = customer
    this.scheduleId = randomUUID()
  }

  public markAsReturned(): void {
    this.status = BookingStatus.RETURNED
  }
}
