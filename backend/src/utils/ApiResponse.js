/**
 * Standard API Response Format
 * Ensures consistent response structure across all endpoints
 */
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  // Static methods for common responses
  static success(data, message = 'Success', statusCode = 200) {
    return new ApiResponse(statusCode, data, message);
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, null, message);
  }

  static error(message, statusCode = 500, data = null) {
    return new ApiResponse(statusCode, data, message);
  }
}

/**
 * Send standardized success response
 */
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  const response = ApiResponse.success(data, message, statusCode);
  return res.status(statusCode).json(response);
};

/**
 * Send standardized error response
 */
export const sendError = (res, message, statusCode = 500, data = null) => {
  const response = ApiResponse.error(message, statusCode, data);
  return res.status(statusCode).json(response);
};

/**
 * Paginated response helper
 */
export const sendPaginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const response = {
    success: true,
    statusCode: 200,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  };
  
  return res.status(200).json(response);
};

export default ApiResponse;
