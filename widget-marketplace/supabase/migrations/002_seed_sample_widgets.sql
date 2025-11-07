-- Insert sample widgets
INSERT INTO widgets (widget_id, name, display_name, description, author_name, author_email, version, downloads, permissions, sizes, download_url) VALUES
(
  'clock-widget',
  'clock',
  'Clock Widget',
  'A simple and elegant clock widget that displays the current time and date.',
  'Molecule Team',
  'team@molecule.xyz',
  '1.0.0',
  1250,
  '{"systemInfo": {"cpu": false, "memory": false}, "network": {"enabled": false}}',
  '{"default": {"width": 200, "height": 150}}',
  'https://example.com/widgets/clock-widget.zip'
),
(
  'system-monitor-widget',
  'system-monitor',
  'System Monitor',
  'Monitor your system''s CPU and memory usage in real-time with beautiful visualizations.',
  'Molecule Team',
  'team@molecule.xyz',
  '1.0.0',
  890,
  '{"systemInfo": {"cpu": true, "memory": true}, "network": {"enabled": false}}',
  '{"default": {"width": 250, "height": 200}}',
  'https://example.com/widgets/system-monitor-widget.zip'
),
(
  'weather-widget',
  'weather',
  'Weather Widget',
  'Get current weather information for your location with a clean, modern interface.',
  'Molecule Team',
  'team@molecule.xyz',
  '1.0.0',
  2100,
  '{"systemInfo": {"cpu": false, "memory": false}, "network": {"enabled": true, "allowedDomains": ["api.openweathermap.org"]}}',
  '{"default": {"width": 220, "height": 180}}',
  'https://example.com/widgets/weather-widget.zip'
);