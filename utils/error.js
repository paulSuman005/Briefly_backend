class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class UnsupportedFileError extends AppError {
  constructor(type) {
    super(`Unsupported file type: ${type}. Allowed: pdf, docx, doc, txt`, 415, "UNSUPPORTED_FILE");
  }
}

export class VectorStoreError extends AppError {
  constructor(message) {
    super(`Vector store error: ${message}`, 503, "VECTOR_STORE_ERROR");
  }
}

export class LLMError extends AppError {
  constructor(message) {
    super(`LLM error: ${message}`, 502, "LLM_ERROR");
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class DocumentNotFoundError extends AppError {
  constructor(docId) {
    super(`Document not found: ${docId}`, 404, "DOCUMENT_NOT_FOUND");
  }
}

export default AppError;