# objective-node-test
API RESTful para locação de filmes desenvolvida em Node.js 20+ e TypeScript.  

Implementada sob a arquitetura de Monólito Modular, utilizando princípios de Clean Architecture e DDD para garantir baixo acoplamento, alta testabilidade e escalabilidade. Solução containerizada com Docker e persistência em MongoDB. 

Tecnologias e Ferramentas

- Runtime: Node.js v20 LTS 
- Linguagem: TypeScript 
- Framework: Express 
- Documentação: TSOA (Swagger/OpenAPI) para geração automática de spec e rotas. 
- Banco de Dados: MongoDB 
- Testes: Jest & Supertest (Unitários e E2E) 

Container: Docker & Docker Compose 

# Arquitetura
O projeto utiliza Inversão de Dependência e Mapeamento de Domínio, separando as responsabilidades em camadas:

- Domain: Regras de negócio, Entidades e Interfaces.
- Application/Service: Casos de uso e orquestração.
- Infra/Repository: Comunicação com MongoDB e drivers externos.
- Presentation: Controllers documentados com decoradores TSOA.

# Como rodar
Certifique-se de ter o Docker e Docker Compose instalados. 
Rode o comando na raiz do projeto:

    No Bash:  docker-compose up --build

O sistema realizará o Seed automático do catálogo de filmes no banco de dados (10 filmes).

Acesse a documentação interativa (Swagger) em: http://localhost:2342/docs