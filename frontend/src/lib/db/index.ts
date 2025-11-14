// Database service factory - switch between mock and real

import { DatabaseService } from './interface';
import { mockDb } from './mock-service';
import { createSupabaseService } from './supabase-service';

/**
 * Get the database service based on environment configuration
 *
 * Set USE_MOCK_DATA=true to use mock data (default for development)
 * Set USE_MOCK_DATA=false to use real Supabase (production)
 */
export function getDatabaseService(): DatabaseService {
  const useMockData = process.env.USE_MOCK_DATA !== 'false';

  if (useMockData) {
    console.log('📦 Using mock database service');
    return mockDb;
  }

  try {
    console.log('🚀 Using Supabase database service');
    return createSupabaseService();
  } catch (error) {
    console.error('❌ Failed to initialize Supabase, falling back to mock data:', error);
    return mockDb;
  }
}

// Singleton instance
export const db = getDatabaseService();

// Re-export types and interfaces
export type { DatabaseService } from './interface';
export * from '@/types/database';
