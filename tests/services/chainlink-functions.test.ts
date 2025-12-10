import chainlinkService from '../../src/services/chainlink';
import { simulateScript } from '@chainlink/functions-toolkit';
import { ExternalServiceException } from '../../src/common/exception/AppException';

// Mock @chainlink/functions-toolkit
jest.mock('@chainlink/functions-toolkit', () => ({
    simulateScript: jest.fn(),
    decodeResult: jest.fn(),
}));

describe('ChainlinkService - Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('requestFunctionsResolution', () => {
        it('should successfully simulate a request', async () => {
            const mockResult = {
                responseBytesHexstring: '0x0000000000000000000000000000000000000000000000000000000000000001',
                capturedTerminalOutput: 'Simulation logs',
                errorString: undefined
            };
            (simulateScript as jest.Mock).mockResolvedValue(mockResult);

            const result = await chainlinkService.requestFunctionsResolution(
                'market-123',
                'https://api.example.com',
                'return Functions.encodeUint256(1);'
            );

            expect(result.status).toBe('simulated_success');
            expect(result.result).toBe(mockResult.responseBytesHexstring);
            expect(simulateScript).toHaveBeenCalledWith(expect.objectContaining({
                source: 'return Functions.encodeUint256(1);',
                args: ['https://api.example.com']
            }));
        });

        it('should handle simulation errors', async () => {
            const mockResult = {
                responseBytesHexstring: undefined,
                capturedTerminalOutput: 'Error logs',
                errorString: 'Simulation failed'
            };
            (simulateScript as jest.Mock).mockResolvedValue(mockResult);

            await expect(chainlinkService.requestFunctionsResolution(
                'market-123',
                'https://api.example.com',
                'throw Error("Fail");'
            )).rejects.toThrow(ExternalServiceException);
        });
    });

    describe('simulateFunctionsScript', () => {
        it('should simulate a script successfully', async () => {
            const mockResult = {
                responseBytesHexstring: '0x1234',
                capturedTerminalOutput: 'Logs',
                errorString: undefined
            };
            (simulateScript as jest.Mock).mockResolvedValue(mockResult);

            const result = await chainlinkService.simulateFunctionsScript(
                'return Functions.encodeString("Hello");',
                ['arg1']
            );

            expect(result.result).toBe('0x1234');
        });
    });

    describe('getFunctionsConfig', () => {
        it('should return functions configuration', () => {
            const result = chainlinkService.getFunctionsConfig();
            expect(result.config).toBeDefined();
            expect(result.config.routerAddress).toBeDefined();
        });
    });
});
