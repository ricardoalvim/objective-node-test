import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Objective Rental API',
      version: '1.0.0',
      description: 'API de Locação de Filmes',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./src/modules/**/*.controller.ts', './src/shared/infra/presentation/**/*.controller.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
