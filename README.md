# 💊 objective-node-test: Bula do Sistema

**Descrição:** API RESTful para locação de filmes desenvolvida em Node.js 20+ e TypeScript.

**Indicação:** Esta solução foi formulada sob a arquitetura de **Monólito Modular**, utilizando princípios de **Clean Architecture** e **DDD**. A escolha desta organização visa garantir a "saúde" do código a longo prazo, oferecendo baixo acoplamento, alta testabilidade (98.3% de cobertura) e escalabilidade imediata. 

**Composição:** Solução totalmente containerizada com Docker, utilizando MongoDB para persistência de dados e TSOA para uma documentação (Swagger) autogerada e tipada.

### 🩺 Informações Técnicas ao Profissional (Arquitetura)

O projeto utiliza **Inversão de Dependência** e **Mapeamento de Domínio**, separando as responsabilidades em camadas para evitar contaminação entre módulos:

- **Domain:** Onde reside o "DNA" do sistema (Regras de negócio, Entidades e Interfaces).
- **Application/Service:** Orquestração dos casos de uso (o tratamento dos sintomas).
- **Infra/Repository:** Comunicação com o tecido de dados (MongoDB) e drivers externos.
- **Presentation:** Interface de exposição via Controllers documentados com decoradores TSOA.

# COMPOSIÇÃO (Tecnologias)
Cada 100ml deste sistema contém:

-> Node.js v20 LTS (Princípio Ativo para performance);

-> TypeScript (Agente estabilizador de tipos);

-> Express (Veículo de roteamento);

-> MongoDB (Substância de persistência);

-> TSOA (Catalisador de documentação Swagger/OpenAPI);

-> Jest/Supertest (Anticorpos contra bugs);

# COMO ESTE SISTEMA FUNCIONA? (Arquitetura)
O sistema age através de uma Arquitetura de Monólito Modular, separando-se em:

-> Domínio: Onde residem as regras de negócio puras (DNA);

-> Serviços: Orquestradores que garantem a correta aplicação das regras;

-> Repositórios: Interface de comunicação com o tecido de dados (MongoDB);

-> Apresentação: Controllers blindados com TSOA para exposição via REST;

### 🧪 Posologia e Modo de Usar (Como rodar)

Para uma administração correta, certifique-se de ter o Docker e Docker Compose instalados no organismo hospedeiro.
Para uma administração eficaz, siga os passos:

Certifique-se de que o organismo possui Docker e Docker Compose.

Na raiz do projeto, administre via Bash:

| docker-compose up --build

O sistema realizará um Seed automático (10 filmes iniciais).
Consulte a evolução do paciente (Swagger) em: http://localhost:2342/docs
Acesse a documentação interativa (Swagger) em: http://localhost:2342/docs

# REAÇÕES ADVERSAS E CONTROLE (Testes e Monitoria)
O sistema possui alta taxa de imunidade (98.3% de cobertura de testes).
Para validar a saúde: npm run test:cov
Para monitoração em tempo real: Acesse o endpoint /api/monitoring/stats para verificar a integridade dos módulos e do banco de dados.

# ADVERTÊNCIAS (Diferenciais Técnicos)
Uso de Native Crypto: Gerenciamento de UUIDs sem dependências externas.

Baixo Acoplamento: Módulos independentes prontos para evolução em microserviços.

Segurança de Tipos: Tipagem forte em todas as camadas, evitando efeitos colaterais em tempo de execução.