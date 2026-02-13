import { Body, Controller, Post, Route, SuccessResponse, Tags } from 'tsoa'
import { BookingService } from '../domain/service/booking.service'
import * as bookingControllerDto from './dto/booking.controller.dto'

@Route('api')
@Tags('Booking')
export class BookingController extends Controller {
  constructor(private readonly bookingService: BookingService) {
    super()
  }

  @SuccessResponse('201', 'Created')
  @Post('/book')
  public async reserve(
    @Body() body: bookingControllerDto.ReserveMovieRequest,
  ): Promise<bookingControllerDto.ReserveMovieResponse> {
    this.setStatus(201)
    return this.bookingService.reserve(body.movieId)
  }

  @SuccessResponse('200', 'Success')
  @Post('/confirm')
  public async confirm(
    @Body() body: bookingControllerDto.ConfirmBookingRequest,
  ): Promise<bookingControllerDto.ConfirmBookingResponse> {
    return this.bookingService.confirm(body)
  }

  @SuccessResponse('200', 'Success')
  @Post('/return')
  public async returnMovie(
    @Body() body: bookingControllerDto.ReturnMovieRequest,
  ): Promise<bookingControllerDto.ReturnMovieResponse> {
    return this.bookingService.returnMovie(body.scheduleId)
  }
}
