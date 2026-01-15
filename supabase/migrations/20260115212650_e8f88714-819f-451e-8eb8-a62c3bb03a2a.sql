-- Create platforms table
CREATE TABLE public.platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;

-- RLS policies for platforms
CREATE POLICY "Anyone can view platforms"
ON public.platforms
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert platforms"
ON public.platforms
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update platforms"
ON public.platforms
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete platforms"
ON public.platforms
FOR DELETE
USING (is_admin());

-- Add platform_id to devices table (nullable for existing devices)
ALTER TABLE public.devices
ADD COLUMN platform_id UUID REFERENCES public.platforms(id) ON DELETE SET NULL;

-- Create trigger for updated_at on platforms
CREATE TRIGGER update_platforms_updated_at
BEFORE UPDATE ON public.platforms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial platforms
INSERT INTO public.platforms (name, description) VALUES
('Enplug', 'Enplug digital signage platform'),
('EngageDSX', 'EngageDSX digital signage platform'),
('GRRID', 'GRRID platform');