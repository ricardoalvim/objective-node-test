import { Db } from 'mongodb'
import { Logger } from '../../shared/logger'
import { randomUUID } from 'node:crypto'

export const seedCatalog = async (db: Db) => {
  const moviesCollection = db.collection('movies')

  await moviesCollection.createIndex({ name: 1 }, { unique: true })
  await moviesCollection.createIndex({ id: 1 }, { unique: true })

  const count = await moviesCollection.countDocuments()

  // Idempotência: só insere se o banco estiver vazio
  if (count > 0) {
    Logger.info('Catalog already seeded. Skipping...')
    return
  }

  const initialMovies = [
    {
      id: randomUUID(),
      name: 'Inception',
      synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
      rating: '5',
      available: true,
    },
    {
      id: randomUUID(),
      name: 'The Matrix',
      synopsis:
        'A computer hacker learns from mysterious rebels about the true nature of his reality.',
      rating: '5',
      available: true,
    },
    {
      id: randomUUID(),
      name: 'Interstellar',
      synopsis:
        'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
      rating: '5',
      available: true,
    },
    {
      id: randomUUID(),
      name: 'Blade Runner 2049',
      synopsis:
        'A young Blade Runner discovery of a long-buried secret leads him to track down Rick Deckard.',
      rating: '4',
      available: true,
    },
    {
      id: randomUUID(),
      name: 'Tales of the Sentry: The First Light',
      synopsis:
        'A cinematic adaptation of the legendary Guardian of Bartowskiland, exploring the origins of the Sentry.',
      rating: '5',
      available: true,
    },
    {
      id: randomUUID(),
      name: 'Numerical Stations: The Movie',
      synopsis:
        'The award-winning thriller from the Pradella Film Festival about encrypted signals and forgotten memories.',
      rating: '5',
      available: true,
    },
  ]

  await moviesCollection.insertMany(initialMovies)
  Logger.info(`Application >: Seeded ${initialMovies.length} movies into the catalog`)
}
