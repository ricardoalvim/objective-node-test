import {
  Collection,
  Db,
  Document,
  Filter,
  OptionalId,
  OptionalUnlessRequiredId,
  WithId,
} from 'mongodb'

export abstract class BaseRepository<T extends Document> {
  protected readonly collection: Collection<T>

  constructor(db: Db, collectionName: string) {
    this.collection = db.collection<T>(collectionName)
  }

  async findAll(filter: Filter<T> = {}): Promise<WithId<T>[]> {
    return this.collection.find(filter).toArray()
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    return this.collection.findOne(filter)
  }

  async create(data: OptionalId<T>): Promise<string> {
    const result = await this.collection.insertOne(data as OptionalUnlessRequiredId<T>)
    return result.insertedId.toString()
  }
}
