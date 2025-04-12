# React SWC TypeScript API Client

A modern React application API client example built with TypeScript, Axios, and TanStack Query.

## Table of Contents

- [Installation](#installation)
- [Service Interfaces](#service-interfaces)
- [Comparison of Two API Call Patterns](#comparison-of-two-api-call-patterns)
  - [Pattern 1: HttpClient + Encapsulated API Path Service](#pattern-1-httpclient--encapsulated-api-path-service)
  - [Pattern 2: TanStack Query + Encapsulated API Path Service](#pattern-2-tanstack-query--encapsulated-api-path-service)
- [Custom Base URL](#custom-base-url)

## Installation

```bash
npm install
npm run dev
```

## Service Interfaces

This project uses TypeScript interfaces to define service contracts. While optional, this approach offers significant benefits:

```typescript
// Service interfaces define the contract for all services
export interface IUserService {
  getUsers: (params?: { limit?: number }) => Promise<User[]>;
  getUserById: (id: number) => Promise<User>;
  createUser: (user: Partial<User>) => Promise<User>;
}

export interface IPostService {
  getPosts: (params?: { limit?: number }) => Promise<Post[]>;
  getPostById: (id: number) => Promise<Post>;
  createPost: (post: Partial<Post>) => Promise<Post>;
  updatePost: (id: number, post: Partial<Post>) => Promise<Post>;
  deletePost: (id: number) => Promise<void>;
}

// Implementation with HttpClient
export const httpUserService: IUserService = {
  getUsers: async (params) => {
    // Implementation using HttpClient
  },
  // Other methods...
};
```

**Benefits of Service Interfaces:**
- **Type Safety**: Ensures implementations follow the contract
- **Separation of Concerns**: Decouples interface from implementation
- **Easier Testing**: Facilitates creating mock implementations
- **Better Maintainability**: Clearly defines expected behavior
- **Consistency**: Enforces consistent API patterns across services

While not strictly necessary for small projects, interfaces become invaluable as applications grow in complexity and team size.

## Comparison of Two API Call Patterns

This project demonstrates two different API call patterns, each with its own advantages in handling API requests.

### Pattern 1: HttpClient + Encapsulated API Path Service

The HttpClient pattern uses an encapsulated HttpClient class combined with a packaged API path service, suitable for scenarios requiring complete control over the request lifecycle.

```typescript
// src/api/core/HttpClient.ts
export class HttpClient {
  private instance: AxiosInstance;
  
  // Initialization
  constructor(baseURL?: string, defaultErrorHandling?: ErrorHandlingOptions) {
    // Create axios instance
    this.instance = axios.create({
      timeout: 30000,
      baseURL: baseURL,
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Set up error interceptor
    setupErrorInterceptor(this.instance, defaultErrorHandling);
  }
  
  // Request methods
  async get<T>(url: string, params?: any, options?: RequestOptions): Promise<AxiosResponse<T>> {
    return this.request<T>(HttpMethod.GET, url, params, options);
  }
  
  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<AxiosResponse<T>> {
    return this.request<T>(HttpMethod.POST, url, data, options);
  }
  
  // ... other methods
}

// src/api/services/httpClientServices.ts
export const httpUserService: IUserService = {
  getUsers: async (params?: { limit?: number }): Promise<User[]> => {
    const limit = params?.limit || 10;
    const response = await fetch(`${API_PATHS.users}?_limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user list: ${response.status}`);
    }
    
    return await response.json();
  },
  
  getUserById: async (id: number): Promise<User> => {
    const response = await fetch(API_PATHS.user(id));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.status}`);
    }
    
    return await response.json();
  },
  
  // ... other methods
};

// Usage example
import React, { useState, useEffect } from 'react';
import { httpClientServices } from '../api/services/httpClient';

function HttpClientDemo() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await httpClientServices.userService.getUsers({ limit: 5 });
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);

  // Render component...
}
```

**Advantages:**
- Complete control over request and response lifecycle
- No need for additional state management libraries
- Can be directly integrated into existing applications
- Simpler learning curve
- Suitable for small applications or specific API call needs

### Pattern 2: TanStack Query + Encapsulated API Path Service

The TanStack Query pattern encapsulates TanStack Query functionality into custom hooks, combined with a packaged API path service, providing separation of business logic and UI, as well as reusable query logic.

```typescript
// src/api/services/queryHooksServices.ts
export const useUserService = (): UserQueryHooks => {
  const queryClient = useQueryClient();
  const { userService } = httpClientServices;
  
  // Get user list
  const useGetUsers = (params?: { limit?: number }, options: GlobalQueryOptions = {}) => {
    return useQuery({
      queryKey: [QueryKeys.users, params],
      queryFn: () => userService.getUsers(params),
      enabled: options.enabled !== false,
      ...options
    });
  };
  
  // Get user details
  const useGetUserById = (id: number, options: GlobalQueryOptions = {}) => {
    return useQuery({
      queryKey: QueryKeys.user(id),
      queryFn: () => userService.getUserById(id),
      enabled: !!id && options.enabled !== false,
      ...options
    });
  };
  
  // Create user
  const useCreateUser = (options: QueryHookOptions = {}) => {
    return useMutation({
      mutationFn: (user: Partial<User>) => userService.createUser(user),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.users] });
        if (options.onSuccess) {
          options.onSuccess(data);
        }
      },
      onError: options.onError
    });
  };
  
  return {
    useGetUsers,
    useGetUserById,
    useCreateUser
  };
};

// Usage example
import React from 'react';
import { useUserService } from '../api/services/queryHooks';

function QueryHooksDemo() {
  const userService = useUserService();
  
  // Use encapsulated Query Hooks
  const { 
    data: users, 
    isLoading, 
    error 
  } = userService.useGetUsers({ limit: 5 });
  
  const { data: userDetails } = userService.useGetUserById(1);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      
      {userDetails && (
        <div>
          <h3>User Details</h3>
          <p>Name: {userDetails.name}</p>
          <p>Email: {userDetails.email}</p>
        </div>
      )}
    </div>
  );
}
```

**Advantages:**
- Centralized API calling logic
- Unified error handling and loading states
- Reusable data query logic
- Separation of business logic and UI
- Built-in data caching and invalidation mechanisms
- Automatic retry and refetch functionality
- Suitable for large applications and team collaboration

## Pattern Comparison Table

| Feature | TanStack Query + Encapsulated API | HttpClient + Encapsulated API |
|---------|----------------------------------|------------------------------|
| Code Reusability | ★★★★★ | ★★★ |
| Flexibility | ★★★ | ★★★★★ |
| Client-side Caching | ★★★★★ | ❌ |
| Automatic Retry | ★★★★★ | ❌ |
| Learning Curve | Medium | Low |
| Type Safety | ★★★★★ | ★★★ |
| Suitable Scenarios | Large Applications | Small Applications/Specific Needs |

## Custom Base URL

You can customize the base URL for each service:

```typescript
// Option 1: Service Factory Pattern
export function createUserService(baseURL = '/api/users') {
  // Create HttpClient instance
  const httpClient = new HttpClient(baseURL);
  
  // Define specific API paths
  const API_PATHS = {
    users: '/users',
    user: (id: number) => `/users/${id}`
  };
  
  // Return service object
  return {
    getUsers: async (params?: { limit?: number }): Promise<User[]> => {
      const response = await httpClient.get(API_PATHS.users, params);
      return response.data;
    },
    getUserById: async (id: number): Promise<User> => {
      const response = await httpClient.get(API_PATHS.user(id));
      return response.data;
    },
    // Other methods...
  };
}

// Use services with custom base URLs
const userService = createUserService('https://api.example.com');
const localUserService = createUserService('http://localhost:3000/api');
```
