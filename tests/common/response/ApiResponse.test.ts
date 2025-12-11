import { ApiResponse } from '../../../src/common/response/ApiResponse';
import { ResponseCode } from '../../../src/common/response/ResponseCode';

describe('ApiResponse', () => {
  describe('success', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'test' };
      const response = ApiResponse.success(data);

      expect(response.status).toBe('SUCCESS');
      expect(response.data).toEqual(data);
      expect(response.error).toBeUndefined();
      expect(response.code).toBe(ResponseCode.SUCCESS.code);
    });

    it('should create success response with custom message', () => {
      const data = { id: 1 };
      const response = ApiResponse.success(data, 'Custom success message');

      expect(response.status).toBe('SUCCESS');
      expect(response.message).toBe('Custom success message');
    });
  });

  describe('created', () => {
    it('should create created response', () => {
      const data = { id: 1, name: 'test' };
      const response = ApiResponse.created(data);

      expect(response.status).toBe('SUCCESS');
      expect(response.code).toBe(ResponseCode.CREATED.code);
      expect(response.data).toEqual(data);
    });
  });

  describe('failed', () => {
    it('should create failed response with code and message', () => {
      const response = ApiResponse.failed(ResponseCode.INVALID_INPUT, 'Invalid data provided');

      expect(response.status).toBe('FAILED');
      expect(response.data).toBeUndefined();
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(ResponseCode.INVALID_INPUT.code);
      expect(response.error?.message).toBe('Invalid data provided');
    });

    it('should create failed response with default message', () => {
      const response = ApiResponse.failed(ResponseCode.INVALID_INPUT);

      expect(response.status).toBe('FAILED');
      expect(response.error?.code).toBe(ResponseCode.INVALID_INPUT.code);
      expect(response.error?.message).toBe(ResponseCode.INVALID_INPUT.message);
    });

    it('should create failed response with details', () => {
      const details = { field: 'email', issue: 'invalid format' };
      const response = ApiResponse.failed(ResponseCode.VALIDATION_ERROR, 'Validation failed', details);

      expect(response.error?.details).toEqual(details);
    });
  });

  describe('error', () => {
    it('should create error response with code and message', () => {
      const response = ApiResponse.error(ResponseCode.INTERNAL_SERVER_ERROR, 'Server error');

      expect(response.status).toBe('ERROR');
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe(ResponseCode.INTERNAL_SERVER_ERROR.code);
      expect(response.error?.message).toBe('Server error');
    });

    it('should create error response with default message', () => {
      const response = ApiResponse.error(ResponseCode.INTERNAL_SERVER_ERROR);

      expect(response.status).toBe('ERROR');
      expect(response.error?.message).toBe(ResponseCode.INTERNAL_SERVER_ERROR.message);
    });
  });

  describe('validationError', () => {
    it('should create validation error response', () => {
      const details = [{ field: 'email', message: 'Required' }];
      const response = ApiResponse.validationError(details);

      expect(response.status).toBe('FAILED');
      expect(response.error?.code).toBe(ResponseCode.VALIDATION_ERROR.code);
      expect(response.error?.details).toEqual(details);
    });
  });

  describe('timestamp', () => {
    it('should include timestamp in response', () => {
      const response = ApiResponse.success({ test: 'data' });

      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp)).toBeInstanceOf(Date);
    });
  });
});
