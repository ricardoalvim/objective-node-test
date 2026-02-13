import 'module-alias/register'
import 'dotenv/config'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { MongoClient } from 'mongodb'

import { CatalogModule } from './modules/catalog/catalog.module'
import * as swaggerDocument from './shared/infra/presentation/swagger.json'

const app = express()
app.use(express.json())

const port = process.env.PORT || 3000

const client = new MongoClient(process.env.MONGO_URL || 'mongodb://localhost:27017')

async function bootstrap() {
  await client.connect()
  const db = client.db('objective_rental')

  app.use('/api', CatalogModule.setup(db))

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
    console.log(`Docs available at http://localhost:${port}/docs`)
  })
}

bootstrap().catch(console.error)
