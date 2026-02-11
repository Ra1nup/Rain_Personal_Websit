-- Add new columns to comments table
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS author_name text NOT NULL DEFAULT 'Anonymous',
ADD COLUMN IF NOT EXISTS author_email text,
ADD COLUMN IF NOT EXISTS author_website text,
ADD COLUMN IF NOT EXISTS notify_reply boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Optional: Update existing comments to have a default name if needed
UPDATE public.comments SET author_name = 'Anonymous' WHERE author_name IS NULL;
