import 'dotenv/config'
import express from 'express'
import { MongoClient } from 'mongodb'
import { Logger } from './shared/logger'
import { CatalogModule } from './modules/catalog/catalog.module'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from '@shared/infra/presentation/swagger.config'

async function bootstrap() {
    const app = express()

    app.use(express.json())
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017'
    const mongoClient = new MongoClient(mongoUrl)

    try {
        Logger.info('Database >: connecting to MongoDB...')
        await mongoClient.connect()
        Logger.info('Database >: connection established successfully')

        const db = mongoClient.db()
        Logger.info('Database >: Seed process finished')

        app.use('/api', CatalogModule.setup(db))

        app.use('/docs', express.static('docs'))

        const PORT = process.env.PORT || 3000
        app.listen(PORT, () => {
            Logger.info('Application >: Server is alive!')
            Logger.info(`Application >: Endpoint: http://localhost:${PORT}`)
        })
    } catch (error) {
        Logger.error('Application >: Failed to bootstrap the application', error)
        process.exit(1)
    }
}

bootstrap()