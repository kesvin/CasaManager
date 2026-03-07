-- Create app_users table expected by server-side login endpoint
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  password_hash text,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now()
);
