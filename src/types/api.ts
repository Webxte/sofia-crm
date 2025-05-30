
// API-related types for HTTP requests and responses

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface ApiSuccessResponse<T = any> {
  data: T;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters?: Record<string, any>;
    sort?: {
      field: string;
      direction: "asc" | "desc";
    };
  };
}

export interface ApiErrorResponse {
  error: ApiError;
  timestamp: string;
  path?: string;
  method?: string;
}

// HTTP method types
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Request configuration
export interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  timeout?: number;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Sort parameters
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Filter parameters (generic)
export interface FilterParams {
  search?: string;
  filters?: Record<string, any>;
  dateFrom?: string;
  dateTo?: string;
}

// Complete query parameters
export interface QueryParams extends PaginationParams, SortParams, FilterParams {
  include?: string[];
  exclude?: string[];
}

// File upload types
export interface FileUploadRequest {
  file: File;
  path?: string;
  bucket?: string;
  metadata?: Record<string, any>;
}

export interface FileUploadResponse {
  url: string;
  path: string;
  size: number;
  mimeType: string;
  metadata?: Record<string, any>;
}

// Batch operation types
export interface BatchRequest<T = any> {
  operation: "create" | "update" | "delete";
  data: T[];
}

export interface BatchResponse<T = any> {
  successful: T[];
  failed: {
    data: T;
    error: ApiError;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Search types
export interface SearchRequest {
  query: string;
  entities?: EntityType[];
  filters?: Record<string, any>;
  limit?: number;
  highlight?: boolean;
}

export interface SearchResult<T = any> {
  entity: EntityType;
  data: T;
  score: number;
  highlights?: Record<string, string[]>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  took: number;
}

// Export types
export interface ExportRequest {
  format: "csv" | "xlsx" | "pdf";
  entities: EntityType[];
  filters?: Record<string, any>;
  fields?: string[];
  template?: string;
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  size: number;
  format: string;
  expiresAt: string;
}

// Import types
export interface ImportRequest {
  file: File;
  entity: EntityType;
  mapping?: Record<string, string>;
  options?: {
    skipHeaders?: boolean;
    delimiter?: string;
    encoding?: string;
    updateExisting?: boolean;
  };
}

export interface ImportPreview {
  headers: string[];
  samples: Record<string, any>[];
  suggested_mapping: Record<string, string>;
  estimated_rows: number;
}

export interface ImportResponse {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: {
    processed: number;
    total: number;
    percentage: number;
  };
  results?: {
    created: number;
    updated: number;
    skipped: number;
    errors: ImportError[];
  };
}

export interface ImportError {
  row: number;
  column: string;
  value: any;
  message: string;
  code?: string;
}

// Webhook types
export interface WebhookEvent<T = any> {
  id: string;
  type: string;
  data: T;
  timestamp: string;
  organization_id: string;
  user_id?: string;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  created_at: string;
  updated_at: string;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Health check
export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  services: {
    database: "healthy" | "unhealthy";
    storage: "healthy" | "unhealthy";
    email: "healthy" | "unhealthy";
  };
}
