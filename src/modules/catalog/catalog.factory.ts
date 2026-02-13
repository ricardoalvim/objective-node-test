import { Db } from 'mongodb'
import { CatalogController } from './presentation/catalog.controller'
import { CatalogService } from './domain/service/catalog.service'
import { MovieRepository } from './repository/catalog.repository'

export const makeCatalogController = (db: Db): CatalogController => {
  const repository = new MovieRepository(db)
  const service = new CatalogService(repository)
  return new CatalogController(service)
}
