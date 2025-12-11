import { 
  BusinessException, 
  ExternalServiceException, 
  UnauthorizedException, 
  NotFoundException 
} from '../../../src/common/exception/AppException';
import { ResponseCode } from '../../../src/common/response/ResponseCode';

describe('AppException Classes', () => {
  describe('BusinessException', () => {
    it('should create BusinessException with code and message', () => {
      const exception = new BusinessException(ResponseCode.INVALID_INPUT, 'Invalid data');

      expect(exception.name).toBe('BusinessException');
      expect(exception.responseCode).toBe(ResponseCode.INVALID_INPUT);
      expect(exception.message).toBe('Invalid data');
      expect(exception).toBeInstanceOf(Error);
    });

    it('should create BusinessException with default message', () => {
      const exception = new BusinessException(ResponseCode.VALIDATION_ERROR);

      expect(exception.responseCode).toBe(ResponseCode.VALIDATION_ERROR);
      expect(exception.message).toBe(ResponseCode.VALIDATION_ERROR.message);
    });
  });

  describe('ExternalServiceException', () => {
    it('should create ExternalServiceException with message', () => {
      const exception = new ExternalServiceException('Service unavailable');

      expect(exception.name).toBe('ExternalServiceException');
      expect(exception.responseCode).toBe(ResponseCode.EXTERNAL_SERVICE_ERROR);
      expect(exception.message).toBe('Service unavailable');
      expect(exception).toBeInstanceOf(Error);
    });

    it('should create ExternalServiceException with default message', () => {
      const exception = new ExternalServiceException();

      expect(exception.message).toBe(ResponseCode.EXTERNAL_SERVICE_ERROR.message);
    });
  });

  describe('UnauthorizedException', () => {
    it('should create UnauthorizedException with message', () => {
      const exception = new UnauthorizedException('Access denied');

      expect(exception.name).toBe('UnauthorizedException');
      expect(exception.responseCode).toBe(ResponseCode.UNAUTHORIZED);
      expect(exception.message).toBe('Access denied');
      expect(exception).toBeInstanceOf(Error);
    });

    it('should create UnauthorizedException with default message', () => {
      const exception = new UnauthorizedException();

      expect(exception.message).toBe(ResponseCode.UNAUTHORIZED.message);
    });
  });

  describe('NotFoundException', () => {
    it('should create NotFoundException with message', () => {
      const exception = new NotFoundException('Resource not found');

      expect(exception.name).toBe('NotFoundException');
      expect(exception.responseCode).toBe(ResponseCode.NOT_FOUND);
      expect(exception.message).toBe('Resource not found');
      expect(exception).toBeInstanceOf(Error);
    });

    it('should create NotFoundException with default message', () => {
      const exception = new NotFoundException();

      expect(exception.message).toBe(ResponseCode.NOT_FOUND.message);
    });
  });
});
