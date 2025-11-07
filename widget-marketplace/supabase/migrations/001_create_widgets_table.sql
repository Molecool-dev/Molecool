CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create widgets table
CREATE TABLE widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  widget_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  author_name VARCHAR(255),
  author_email VARCHAR(255),
  version VARCHAR(50) NOT NULL,
  downloads INTEGER DEFAULT 0,
  permissions JSONB,
  sizes JSONB,
  icon_url TEXT,
  download_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_widgets_widget_id ON widgets(widget_id);
CREATE INDEX idx_widgets_downloads ON widgets(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_widgets_created_at ON widgets(created_at DESC);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_widgets_updated_at
  BEFORE UPDATE ON widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE widgets IS 'Stores all available widgets in the Molecule marketplace';
COMMENT ON COLUMN widgets.widget_id IS 'Unique identifier for the widget (e.g., "clock-widget")';
COMMENT ON COLUMN widgets.permissions IS 'JSONB object defining required permissions (systemInfo, network)';
COMMENT ON COLUMN widgets.sizes IS 'JSONB object defining widget dimensions (default, min, max)';
COMMENT ON COLUMN widgets.downloads IS 'Total number of times this widget has been downloaded';

-- Enable Row Level Security (RLS)
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON widgets
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated insert (for future admin features)
CREATE POLICY "Allow authenticated insert" ON widgets
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');