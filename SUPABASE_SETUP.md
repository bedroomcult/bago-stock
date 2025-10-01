# Supabase Setup Instructions

## 1. Create a Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

## 2. Get Your Project Credentials
1. Go to your project dashboard
2. Navigate to "Settings" -> "API"
3. Copy the following values:
   - **URL**: Your Supabase project URL
   - **Anon/Public API Key**: Your public API key
   - **Service Role Key**: Your service role key (keep this secure)

## 3. Configure Database Schema
1. Go to the "SQL Editor" in your Supabase dashboard
2. Run the SQL commands from `database_schema.sql` file
3. This will create all the necessary tables for the application

## 4. Update Environment Variables
1. Copy the credentials to your `.env` file:
   ```
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## 5. Install the Supabase PHP Client
Since we can't use Composer in your environment, you need to manually download the Supabase PHP client library:

1. Download the library from: https://github.com/supabase-community/supabase-php
2. Or use the CDN version if available
3. Place the library in a `vendor` directory in your project

## 6. Alternative PHP Client Installation
If you don't have Composer installed, you can:

1. Download the Supabase PHP client manually:
   ```
   mkdir vendor
   cd vendor
   git clone https://github.com/supabase-community/supabase-php.git
   ```

2. Or download the files directly and extract them to the `vendor` directory

## 7. Verify the Connection
After setting up, test your connection by running a simple API call to ensure everything is properly configured.

## 8. Enable Row Level Security (RLS) (Optional but Recommended)
For additional security, you can enable Row Level Security on your tables:
1. Go to "Authentication" in your Supabase dashboard
2. Consider implementing RLS policies based on user roles