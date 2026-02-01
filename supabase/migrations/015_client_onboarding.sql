-- Create client onboarding sessions table
CREATE TABLE IF NOT EXISTS public.client_onboarding_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commissioner_id UUID NOT NULL REFERENCES public.commissioners(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    project_scope TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'in_progress', 'completed', 'converted')),
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Policies omitted for brevity in file (applied via MCP)
