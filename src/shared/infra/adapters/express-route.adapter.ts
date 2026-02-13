import { Request, Response } from 'express'
import { HttpResponse } from '@shared/infra/presentation/protocols/http'

type ControllerMethod = (req: Request) => Promise<HttpResponse>

export const adaptRoute = (controllerMethod: ControllerMethod) => {
  return async (req: Request, res: Response) => {
    try {
      const httpResponse = await controllerMethod(req)

      if (httpResponse.statusCode >= 200 && httpResponse.statusCode <= 299) {
        res.status(httpResponse.statusCode).json(httpResponse.data)
      } else {
        res.status(httpResponse.statusCode).json({
          error: httpResponse.data.message || httpResponse.data,
        })
      }
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}
