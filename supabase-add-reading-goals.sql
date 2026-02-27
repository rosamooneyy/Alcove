-- Add reading goals columns to profiles table

-- Add goal columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS goal_daily_type TEXT DEFAULT 'pages' CHECK (goal_daily_type IN ('pages', 'minutes')),
ADD COLUMN IF NOT EXISTS goal_daily_target INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_monthly_books INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_yearly_books INTEGER DEFAULT 0;

-- Create index for faster goal queries
CREATE INDEX IF NOT EXISTS idx_profiles_goals ON profiles(goal_daily_target, goal_monthly_books, goal_yearly_books);

-- Verify
SELECT 'SUCCESS! Reading goals columns added to profiles table' as status;
