export interface HttpResponse<T = unknown> {
  statusCode: number
  data?: T
  error?: string
}
