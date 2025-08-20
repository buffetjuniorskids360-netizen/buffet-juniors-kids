// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // Base delay for exponential backoff
};

// Custom error classes
export class NetworkError extends Error {
  constructor(message: string, public readonly isTimeout: boolean = false) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Utility function for exponential backoff delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Client with timeout and retry logic
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor(baseURL = '/api', timeout = API_CONFIG.TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
  }

  private async requestWithTimeout<T>(url: string, config: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new NetworkError(`Request timeout after ${timeout}ms`, true);
      }
      throw error;
    }
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);

    let lastError: Error = new Error('Request failed');
    
    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.requestWithTimeout(url, config, this.timeout);
        
        console.log(`📡 API Response (attempt ${attempt + 1}): ${response.status} ${response.statusText}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            error: 'Network error', 
            message: response.statusText 
          }));
          
          // Don't retry client errors (4xx), only server errors (5xx) and network issues
          if (response.status < 500) {
            throw new ApiError(errorData.message || errorData.error || 'Request failed', response.status);
          }
          
          throw new ApiError(errorData.message || errorData.error || 'Server error', response.status);
        }

        return await response.json();
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`🚨 API Error (attempt ${attempt + 1}): ${options.method || 'GET'} ${url}`, error);

        // Don't retry client errors
        if (error instanceof ApiError && error.status < 500) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === this.retryAttempts) {
          break;
        }

        // Exponential backoff delay
        const delayMs = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt);
        console.log(`⏳ Retrying in ${delayMs}ms... (attempt ${attempt + 2}/${this.retryAttempts + 1})`);
        await delay(delayMs);
      }
    }

    // If we get here, all retries failed
    console.error(`🚨 All retry attempts failed for ${options.method || 'GET'} ${url}`);
    throw lastError;
  }

  // Auth methods
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request('/auth/me');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();