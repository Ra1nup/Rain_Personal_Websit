-- Add parent_id column to comments table
alter table public.comments
add column parent_id uuid references public.comments(id);
