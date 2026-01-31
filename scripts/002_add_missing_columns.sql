-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS best_time INTEGER,
ADD COLUMN IF NOT EXISTS average_time INTEGER,
ADD COLUMN IF NOT EXISTS total_attempts INTEGER DEFAULT 0;

-- Copy data from best_reaction_time to best_time if exists
UPDATE public.profiles 
SET best_time = best_reaction_time 
WHERE best_reaction_time IS NOT NULL AND best_time IS NULL;

-- Create index for the new columns
CREATE INDEX IF NOT EXISTS idx_profiles_best_time ON public.profiles(best_time ASC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_profiles_average_time ON public.profiles(average_time ASC NULLS LAST);
