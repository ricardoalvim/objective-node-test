import { Logger } from './logger'

function stripAnsi(input: string): string {
    return input.replace(/\x1b\[[0-9;]*m/g, '')
}

describe('Logger', () => {
    let consoleInfoSpy: jest.SpyInstance
    let consoleWarnSpy: jest.SpyInstance
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
        consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    })

    afterEach(() => {
        consoleInfoSpy.mockRestore()
        consoleWarnSpy.mockRestore()
        consoleErrorSpy.mockRestore()
    })

    describe('info', () => {
        it('logs info with level and message', () => {
            Logger.info('hello')
            expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
            const call = consoleInfoSpy.mock.calls[0][0] as string
            const clean = stripAnsi(call)
            expect(clean).toMatch(/\[INFO\]/)
            expect(clean).toContain('hello')
        })

        it('includes ISO timestamp', () => {
            Logger.info('t')
            const call = consoleInfoSpy.mock.calls[0][0] as string
            const clean = stripAnsi(call)
            expect(clean).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        })
    })

    describe('warn', () => {
        it('logs warn with level and message', () => {
            Logger.warn('warn')
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
            const call = consoleWarnSpy.mock.calls[0][0] as string
            const clean = stripAnsi(call)
            expect(clean).toMatch(/\[WARN\]/)
            expect(clean).toContain('warn')
        })
    })

    describe('error', () => {
        it('logs error with level and message', () => {
            Logger.error('err')
            expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
            const call = consoleErrorSpy.mock.calls[0][0] as string
            const clean = stripAnsi(call)
            expect(clean).toMatch(/\[ERROR\]/)
            expect(clean).toContain('err')
        })

        it('appends stack when Error passed', () => {
            const e = new Error('boom')
            Logger.error('oops', e)
            const call = consoleErrorSpy.mock.calls[0][0] as string
            const clean = stripAnsi(call)
            expect(clean).toContain('boom')
            expect(clean).toContain('Error: boom')
        })

        it('does not crash with non-error param', () => {
            expect(() => Logger.error('m', 'string')).not.toThrow()
        })
    })

    describe('robustness', () => {
        it('handles empty and long messages', () => {
            expect(() => {
                Logger.info('')
                Logger.warn('')
                Logger.error('')
                Logger.info('x'.repeat(10000))
            }).not.toThrow()
        })
    })
})
