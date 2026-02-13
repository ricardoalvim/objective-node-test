import 'dotenv/config'
import express from 'express'
import { MongoClient } from 'mongodb'
import { Logger } from '@shared/logger'

async function bootstrap() {
    const app = express()
    app.use(express.json())

    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017'
    const mongoClient = new MongoClient(mongoUrl)

    try {
        Logger.info('Attempting to connect to MongoDB...')
        await mongoClient.connect()
        Logger.info('📦 Database connection established successfully')

        const db = mongoClient.db()

        const PORT = process.env.PORT || 3000
        app.listen(PORT, () => {
            Logger.info(`🚀 Server is barking on http://localhost:${PORT}`)
        })
    } catch (error) {
        Logger.error('❌ Failed to bootstrap the application', error)
        process.exit(1)
    }
}

bootstrap()