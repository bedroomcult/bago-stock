// Simple synchronous Supabase client initialization
let supabaseClient = null;

// Check if environment variables are available
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Warning: Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in server/.env');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);
  // Create a mock client for development
  supabaseClient = {
    from: function(table) {
      return {
        select: function(columns = '*') {
          return {
            eq: function(column, value) { return this; },
            single: function() { return { data: null, error: { message: 'Supabase not configured' } }; },
            range: function(start, end) { return this; },
            gt: function(column, value) { return this; },
            gte: function(column, value) { return this; },
            lt: function(column, value) { return this; },
            lte: function(column, value) { return this; },
            like: function(column, pattern) { return this; },
            ilike: function(column, pattern) { return this; },
            in: function(column, values) { return this; },
            is: function(column, value) { return this; },
            order: function(column, options) { return this; },
            execute: function() { return { data: [], error: null }; }
          };
        },
        insert: function(data) {
          return {
            select: function() { return this; },
            single: function() { return this; },
            execute: function() { return { data: [data], error: null }; }
          };
        },
        update: function(data) {
          return {
            eq: function(column, value) { return this; },
            select: function() { return this; },
            single: function() { return this; },
            execute: function() { return { data: [data], error: null }; }
          };
        },
        delete: function() {
          return {
            eq: function(column, value) { return this; },
            execute: function() { return { data: [], error: null }; }
          };
        }
      };
    }
  };
} else {
  // Try to initialize the real Supabase client
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.error('Error initializing Supabase client:', error.message);
    throw new Error('Failed to initialize Supabase client: ' + error.message);
    /*
    // Create a mock client as fallback
    supabaseClient = {
      from: function(table) {
        return {
          select: function(columns = '*') {
            return {
              eq: function(column, value) { return this; },
              single: function() { return { data: null, error: { message: 'Supabase not configured' } }; },
              range: function(start, end) { return this; },
              gt: function(column, value) { return this; },
              gte: function(column, value) { return this; },
              lt: function(column, value) { return this; },
              lte: function(column, value) { return this; },
              like: function(column, pattern) { return this; },
              ilike: function(column, pattern) { return this; },
              in: function(column, values) { return this; },
              is: function(column, value) { return this; },
              order: function(column, options) { return this; },
              execute: function() { return { data: [], error: null }; }
            };
          },
          insert: function(data) {
            return {
              select: function() { return this; },
              single: function() { return this; },
              execute: function() { return { data: [data], error: null }; }
            };
          },
          update: function(data) {
            return {
              eq: function(column, value) { return this; },
              select: function() { return this; },
              single: function() { return this; },
              execute: function() { return { data: [data], error: null }; }
            };
          },
          delete: function() {
            return {
              eq: function(column, value) { return this; },
              execute: function() { return { data: [], error: null }; }
            };
          }
        };
      }
    };
    */
  }
}

function getSupabaseClient() {
  return supabaseClient;
}

module.exports = { getSupabaseClient };
