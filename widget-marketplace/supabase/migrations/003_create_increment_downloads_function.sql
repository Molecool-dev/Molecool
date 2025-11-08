-- Create a function to atomically increment widget download count
-- This prevents race conditions when multiple downloads happen simultaneously

CREATE OR REPLACE FUNCTION increment_widget_downloads(widget_id_param TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE widgets
  SET downloads = downloads + 1
  WHERE widget_id = widget_id_param;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION increment_widget_downloads(TEXT) TO anon, authenticated;
