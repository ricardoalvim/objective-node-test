import { Controller, Get, Route, Tags } from 'tsoa'
import { MonitoringService } from '../domain/service/monitoring.service'
import { SystemStatus } from './dto/monitoring.dto'

@Route('api/monitoring')
@Tags('Monitoring')
export class MonitoringController extends Controller {
    constructor(private readonly monitoringService: MonitoringService) {
        super()
    }

    /**
     * Retorna o status geral da locadora.
     * Inclui estatísticas de filmes, aluguéis e clientes.
     */
    @Get('/status')
    public async getStatus(): Promise<SystemStatus> {
        return this.monitoringService.getStatus()
    }
}
