import 'module-alias/register'
import 'dotenv/config'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { MongoClient } from 'mongodb'

import { CatalogModule } from './modules/catalog/catalog.module'
import { BookingModule } from '@modules/booking/booking.module'
import { MonitoringModule } from '@modules/monitoring/monitoring.module'
import * as swaggerDocument from './shared/infra/presentation/swagger.json'
import { errorHandler } from './shared/infra/error-handler.middleware'

const app = express()
app.use(express.json())

const port = process.env.PORT || 2342

const client = new MongoClient(process.env.MONGO_URL || 'mongodb://localhost:27017')

async function bootstrap() {
  await client.connect()
  const db = client.db('objective_rental')

  // REST APIs
  app.use('/api', CatalogModule.setup(db))
  app.use('/api', BookingModule.setup(db))
  app.use('/api', MonitoringModule.setup(db))

  //Swagger TSOA  
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  app.use(errorHandler)

  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    console.log(`Docs available at http://localhost:${port}/docs`)
  })
}

bootstrap().catch(console.error)
