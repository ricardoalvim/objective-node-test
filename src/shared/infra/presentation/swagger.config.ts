import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Objective Rental API',
            version: '1.0.0',
            description: 'Documentação da API de Locação - Contexto Bartowskiland',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local',
            },
        ],
    },
    // Aqui está o pulo do gato: ele varre todos os controllers nos módulos
    apis: ['./src/modules/**/*.controller.ts', './src/shared/infra/presentation/protocols/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)