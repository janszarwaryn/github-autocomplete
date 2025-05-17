import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Define handlers for GitHub API endpoints
const handlers = [
  // GitHub Users API mock
  http.get('https://api.github.com/search/users', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    
    // Return empty results if no query
    if (!query) {
      return HttpResponse.json({
        total_count: 0,
        incomplete_results: false,
        items: []
      })
    }
    
    // Mock data for 'test' query
    if (query === 'test') {
      return HttpResponse.json({
        total_count: 2,
        incomplete_results: false,
        items: [
          {
            login: 'testuser1',
            id: 1,
            node_id: 'node1',
            avatar_url: 'https://example.com/avatar1.png',
            gravatar_id: '',
            url: 'https://api.github.com/users/testuser1',
            html_url: 'https://github.com/testuser1',
            type: 'User',
            score: 1
          },
          {
            login: 'testuser2',
            id: 2,
            node_id: 'node2',
            avatar_url: 'https://example.com/avatar2.png',
            gravatar_id: '',
            url: 'https://api.github.com/users/testuser2',
            html_url: 'https://github.com/testuser2',
            type: 'User',
            score: 0.8
          }
        ]
      })
    }
    
    // Mock error response for 'error' query
    if (query === 'error') {
      return new HttpResponse(
        JSON.stringify({ message: 'API rate limit exceeded' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
    
    // Default response
    return HttpResponse.json({
      total_count: 0,
      incomplete_results: false,
      items: []
    })
  }),
  
  // GitHub Repositories API mock
  http.get('https://api.github.com/search/repositories', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    
    // Return empty results if no query
    if (!query) {
      return HttpResponse.json({
        total_count: 0,
        incomplete_results: false,
        items: []
      })
    }
    
    // Mock data for 'test' query
    if (query === 'test') {
      return HttpResponse.json({
        total_count: 2,
        incomplete_results: false,
        items: [
          {
            id: 3,
            node_id: 'node3',
            name: 'testrepo',
            full_name: 'testuser1/testrepo',
            owner: {
              login: 'testuser1',
              id: 1,
              avatar_url: 'https://example.com/avatar1.png',
              url: 'https://api.github.com/users/testuser1',
              html_url: 'https://github.com/testuser1'
            },
            html_url: 'https://github.com/testuser1/testrepo',
            description: 'A test repository',
            stargazers_count: 10
          },
          {
            id: 4,
            node_id: 'node4',
            name: 'testing-lib',
            full_name: 'testuser2/testing-lib',
            owner: {
              login: 'testuser2',
              id: 2,
              avatar_url: 'https://example.com/avatar2.png',
              url: 'https://api.github.com/users/testuser2',
              html_url: 'https://github.com/testuser2'
            },
            html_url: 'https://github.com/testuser2/testing-lib',
            description: 'A testing library',
            stargazers_count: 5
          }
        ]
      })
    }
    
    // Mock error response for 'error' query
    if (query === 'error') {
      return new HttpResponse(
        JSON.stringify({ message: 'API rate limit exceeded' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
    
    // Default response
    return HttpResponse.json({
      total_count: 0,
      incomplete_results: false,
      items: []
    })
  })
]

// Setup MSW server
export const server = setupServer(...handlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Clean up after each test
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Close server after all tests
afterAll(() => server.close())

// Mock IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

// Mock window.open
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn()
})
