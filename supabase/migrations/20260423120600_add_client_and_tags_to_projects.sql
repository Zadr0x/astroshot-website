ALTER TABLE public.projects
ADD COLUMN client TEXT NULL;

ALTER TABLE public.projects
ADD COLUMN tags TEXT[] NULL;
