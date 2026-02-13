/**
 * @openapi
 * components:
 * schemas:
 * Movie:
 * type: object
 * properties:
 * id:
 * type: string
 * format: uuid
 * name:
 * type: string
 * synopsis:
 * type: string
 * rating:
 * type: string
 * available:
 * type: boolean
 */
export interface MovieRepositoryDTO {
    id: string
    name: string
    synopsis: string
    rating: string
    available: boolean
}