-- ==============================================================================
-- NIVAARI FOUNDING 100 RESEARCH STUDY DATABASE SCHEMA
-- Version: founding_100_v1
-- Description: Separate contact details from research answers, enforce RLS,
--              record versioned consent, and prevent unauthorized client reads.
-- ==============================================================================

-- 1. Create research_participants table (Stores contact & consent metadata)
CREATE TABLE IF NOT EXISTS public.research_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT,
    email TEXT,
    phone TEXT,
    contact_permission BOOLEAN NOT NULL DEFAULT false,
    updates_permission BOOLEAN NOT NULL DEFAULT false,
    consent_version TEXT NOT NULL,
    consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    withdrawn_at TIMESTAMPTZ
);

-- 2. Create research_responses table (Session metadata, pseudonymized)
CREATE TABLE IF NOT EXISTS public.research_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES public.research_participants(id) ON DELETE SET NULL,
    survey_version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('in_progress', 'submitted', 'withdrawn')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ DEFAULT now(),
    client_submission_id TEXT UNIQUE,
    points_earned INTEGER NOT NULL DEFAULT 0
);

-- 3. Create research_answers table (Granular answers linked to response_id)
CREATE TABLE IF NOT EXISTS public.research_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.research_responses(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    answer_json JSONB NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    question_version TEXT NOT NULL DEFAULT 'v1'
);

-- 4. Create consent_records table (Audit trail of individual consent grants)
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES public.research_responses(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL,
    granted BOOLEAN NOT NULL,
    notice_version TEXT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexing for performance and lookup
CREATE INDEX IF NOT EXISTS idx_research_answers_response_id ON public.research_answers(response_id);
CREATE INDEX IF NOT EXISTS idx_research_answers_question_id ON public.research_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_response_id ON public.consent_records(response_id);
CREATE INDEX IF NOT EXISTS idx_research_responses_participant ON public.research_responses(participant_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Launch Requirement: Enable RLS on every table. Deny read access to anon.
-- ==============================================================================

ALTER TABLE public.research_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- Anonymous users (study participants) may INSERT their own submission,
-- but NEVER read, update, or delete records from the client API.

-- Policy: Allow anon to insert participant record (only when valid consent is present)
CREATE POLICY "Allow anon insert participants"
    ON public.research_participants
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (consent_version IS NOT NULL);

-- Policy: Allow anon to insert response record
CREATE POLICY "Allow anon insert responses"
    ON public.research_responses
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (survey_version IS NOT NULL);

-- Policy: Allow anon to insert answer records
CREATE POLICY "Allow anon insert answers"
    ON public.research_answers
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (question_id IS NOT NULL AND answer_json IS NOT NULL);

-- Policy: Allow anon to insert consent records
CREATE POLICY "Allow anon insert consent records"
    ON public.consent_records
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (consent_type IS NOT NULL);

-- Explicitly deny SELECT, UPDATE, DELETE to anon on all tables
-- (In Supabase RLS, default without a SELECT policy is deny-all).
-- Only authenticated research admins (e.g. service_role or admin role) can query data.

-- ==============================================================================
-- ATOMIC SUBMISSION RPC FUNCTION (Optional server-side transaction)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.submit_research_form(
    p_submission_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_response_id UUID;
    v_participant_id UUID := NULL;
    v_survey_version TEXT;
    v_started_at TIMESTAMPTZ;
    v_submitted_at TIMESTAMPTZ;
    v_contact JSONB;
    v_consent JSONB;
    v_answers JSONB;
    v_answer_item JSONB;
    v_client_id TEXT;
    v_points_calculated INTEGER := 0;
BEGIN
    v_client_id := p_submission_payload->>'response_id';
    v_survey_version := p_submission_payload->>'survey_version';
    v_started_at := (p_submission_payload->>'started_at')::TIMESTAMPTZ;
    v_submitted_at := (p_submission_payload->>'submitted_at')::TIMESTAMPTZ;
    v_contact := p_submission_payload->'contact';
    v_consent := p_submission_payload->'consent';
    v_answers := p_submission_payload->'answers';

    -- Validate score server-side: 5 points per qualifying research answer
    IF v_answers IS NOT NULL AND jsonb_typeof(v_answers) = 'array' THEN
        v_points_calculated := jsonb_array_length(v_answers) * 5;
    END IF;

    -- Check for duplicate submission
    IF EXISTS (SELECT 1 FROM public.research_responses WHERE client_submission_id = v_client_id) THEN
        RETURN jsonb_build_object('success', true, 'duplicate', true, 'message', 'Response already recorded');
    END IF;

    -- 1. Insert participant if contact details provided
    IF v_contact IS NOT NULL AND (v_contact->>'email' IS NOT NULL OR v_contact->>'phone' IS NOT NULL OR v_contact->>'name' IS NOT NULL) THEN
        INSERT INTO public.research_participants (
            name,
            email,
            phone,
            contact_permission,
            updates_permission,
            consent_version,
            consented_at
        ) VALUES (
            v_contact->>'name',
            v_contact->>'email',
            v_contact->>'phone',
            COALESCE((v_contact->>'contact_permission')::BOOLEAN, false),
            COALESCE((v_contact->>'updates_permission')::BOOLEAN, false),
            COALESCE(v_consent->>'notice_version', 'v1'),
            COALESCE((v_consent->>'recorded_at')::TIMESTAMPTZ, now())
        ) RETURNING id INTO v_participant_id;
    END IF;

    -- 2. Insert research_responses record (with server-validated points)
    INSERT INTO public.research_responses (
        participant_id,
        survey_version,
        status,
        started_at,
        submitted_at,
        client_submission_id,
        points_earned
    ) VALUES (
        v_participant_id,
        v_survey_version,
        'submitted',
        v_started_at,
        v_submitted_at,
        v_client_id,
        v_points_calculated
    ) RETURNING id INTO v_response_id;

    -- 3. Insert individual consent records
    IF v_consent IS NOT NULL THEN
        INSERT INTO public.consent_records (response_id, consent_type, granted, notice_version, recorded_at)
        VALUES
            (v_response_id, 'age_confirmed', COALESCE((v_consent->>'age_confirmed')::BOOLEAN, true), v_consent->>'notice_version', (v_consent->>'recorded_at')::TIMESTAMPTZ),
            (v_response_id, 'research_granted', COALESCE((v_consent->>'research_granted')::BOOLEAN, true), v_consent->>'notice_version', (v_consent->>'recorded_at')::TIMESTAMPTZ),
            (v_response_id, 'sensitive_data_granted', COALESCE((v_consent->>'sensitive_data_granted')::BOOLEAN, true), v_consent->>'notice_version', (v_consent->>'recorded_at')::TIMESTAMPTZ),
            (v_response_id, 'contact_granted', COALESCE((v_consent->>'contact_granted')::BOOLEAN, false), v_consent->>'notice_version', (v_consent->>'recorded_at')::TIMESTAMPTZ),
            (v_response_id, 'updates_granted', COALESCE((v_consent->>'updates_granted')::BOOLEAN, false), v_consent->>'notice_version', (v_consent->>'recorded_at')::TIMESTAMPTZ);
    END IF;

    -- 4. Insert each answer
    FOR v_answer_item IN SELECT * FROM jsonb_array_elements(v_answers)
    LOOP
        INSERT INTO public.research_answers (
            response_id,
            question_id,
            answer_json,
            answered_at,
            question_version
        ) VALUES (
            v_response_id,
            v_answer_item->>'question_id',
            v_answer_item->'answer',
            COALESCE((v_answer_item->>'answered_at')::TIMESTAMPTZ, now()),
            COALESCE(v_answer_item->>'question_version', 'v1')
        );
    END LOOP;

    RETURN jsonb_build_object('success', true, 'response_id', v_response_id);
END;
$$;

