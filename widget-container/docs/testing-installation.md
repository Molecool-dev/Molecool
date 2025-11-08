# Testing Widget Installation

## Prerequisites

1. Widget Container is built and running
2. Marketplace is deployed and accessible
3. At least one widget is available in the Marketplace with a valid download URL

## Test Scenarios

### Scenario 1: Successful Installation

**Steps:**
1. Open the Marketplace in a browser
2. Navigate to a widget detail page (e.g., Clock Widget)
3. Click the "Install" button
4. Confirm the installation dialog in Widget Container
5. Wait for the installation to complete

**Expected Result:**
- Installation success dialog appears
- Widget is extracted to `%APPDATA%/Molecool-widget-container/widgets/{widgetId}/`
- Widget appears in the installed widgets list
- Download count is incremented in the Marketplace

**Verification:**
```powershell
# Check if widget directory exists
dir "$env:APPDATA\Molecool-widget-container\widgets\clock-widget"

# Should contain:
# - widget.config.json
# - dist/
# - icon.png (optional)
```

### Scenario 2: Widget Not Found

**Steps:**
1. Open URL: `widget://install/nonexistent-widget`
2. Confirm the installation dialog

**Expected Result:**
- Error dialog: "Widget not found in marketplace"
- No files created in widgets directory

### Scenario 3: Network Error

**Steps:**
1. Disconnect from the internet
2. Open URL: `widget://install/clock-widget`
3. Confirm the installation dialog

**Expected Result:**
- Error dialog: "Network error" or "Request timeout"
- No files created in widgets directory

### Scenario 4: Invalid Widget Package

**Steps:**
1. Create a widget in the Marketplace with an invalid download URL
2. Try to install the widget

**Expected Result:**
- Error dialog: "Failed to download widget" or "Failed to extract widget"
- Partial installation is cleaned up

### Scenario 5: Widget ID Mismatch

**Steps:**
1. Create a widget package where the widget.config.json has a different ID
2. Try to install the widget

**Expected Result:**
- Error dialog: "Widget ID mismatch"
- Installation is rolled back

### Scenario 6: Duplicate Installation

**Steps:**
1. Install a widget successfully
2. Try to install the same widget again

**Expected Result:**
- Widget is overwritten with the new version
- No errors occur

### Scenario 7: Installation Cancellation

**Steps:**
1. Open URL: `widget://install/clock-widget`
2. Click "Cancel" in the confirmation dialog

**Expected Result:**
- Installation is cancelled
- No files are downloaded or created
- No error dialogs appear

## Manual Testing Checklist

- [ ] Install a widget from the Marketplace
- [ ] Verify widget files are extracted correctly
- [ ] Verify widget.config.json is valid
- [ ] Verify widget appears in Widget Manager
- [ ] Create an instance of the installed widget
- [ ] Verify download count increments
- [ ] Test with invalid widget ID
- [ ] Test with network disconnected
- [ ] Test cancellation flow
- [ ] Test with already installed widget

## Automated Testing

To run automated tests (when implemented):

```bash
cd widget-container
npm test -- --run
```

## Debugging

### Enable Verbose Logging

Check the Electron console for detailed logs:

```
Starting installation of widget: clock-widget
Fetching widget metadata from: https://...
Fetched metadata for widget: Clock Widget
Downloading widget from: https://...
Downloaded widget package to: C:\Users\...\Temp\clock-widget.widget
Extracting widget from ... to ...
Widget extracted successfully
Widget Clock Widget installed successfully
```

### Common Issues

**Issue: "Module not found: adm-zip"**
- Solution: Run `npm install adm-zip @types/adm-zip` in widget-container

**Issue: "Widget not found in marketplace"**
- Solution: Verify the widget exists in the Marketplace database
- Check the widget_id matches exactly

**Issue: "Failed to extract widget"**
- Solution: Verify the download URL points to a valid zip file
- Check the zip file structure matches the expected format

**Issue: "Invalid widget configuration"**
- Solution: Verify widget.config.json has all required fields
- Check the JSON syntax is valid

## Environment Setup

### Local Development

For local testing, set the Marketplace URL:

```bash
# Windows
set MARKETPLACE_URL=http://localhost:3000

# macOS/Linux
export MARKETPLACE_URL=http://localhost:3000
```

### Production

The default Marketplace URL is: `https://Molecool-marketplace.vercel.app`

## Test Data

### Sample Widget Metadata

```json
{
  "widget_id": "test-widget",
  "name": "test",
  "display_name": "Test Widget",
  "description": "A test widget for installation testing",
  "author_name": "Test Author",
  "author_email": "test@example.com",
  "version": "1.0.0",
  "downloads": 0,
  "permissions": {
    "systemInfo": {
      "cpu": false,
      "memory": false
    },
    "network": {
      "enabled": false
    }
  },
  "sizes": {
    "default": {
      "width": 200,
      "height": 200
    }
  },
  "download_url": "https://example.com/test-widget.widget"
}
```

### Creating a Test Widget Package

```bash
# Create widget directory
mkdir test-widget
cd test-widget

# Create widget.config.json
echo '{
  "id": "test-widget",
  "name": "test",
  "displayName": "Test Widget",
  "version": "1.0.0",
  "description": "A test widget",
  "author": {
    "name": "Test Author",
    "email": "test@example.com"
  },
  "permissions": {
    "systemInfo": {
      "cpu": false,
      "memory": false
    },
    "network": {
      "enabled": false
    }
  },
  "sizes": {
    "default": {
      "width": 200,
      "height": 200
    }
  },
  "entryPoint": "dist/index.html"
}' > widget.config.json

# Create dist directory with index.html
mkdir dist
echo '<html><body>Test Widget</body></html>' > dist/index.html

# Create zip package
# Windows: Use 7-Zip or built-in compression
# Compress-Archive -Path * -DestinationPath ../test-widget.widget

# macOS/Linux:
# zip -r ../test-widget.widget *
```

## Performance Testing

### Metrics to Monitor

- Download time for various package sizes
- Extraction time
- Memory usage during installation
- Network bandwidth usage

### Expected Performance

- Small widget (< 1MB): < 5 seconds
- Medium widget (1-5MB): < 15 seconds
- Large widget (5-10MB): < 30 seconds

## Security Testing

- [ ] Verify widget ID validation prevents path traversal
- [ ] Verify only HTTPS downloads are allowed
- [ ] Verify widget.config.json validation prevents malicious configs
- [ ] Verify failed installations are cleaned up completely
- [ ] Verify widgets run in sandbox after installation
