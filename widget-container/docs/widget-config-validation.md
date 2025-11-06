# Widget Configuration Validation

## Overview

The Widget Manager implements comprehensive validation for `widget.config.json` files to ensure all widgets meet the required structure and security standards before loading.

## Validation Process

When loading widgets from the widgets directory, each `widget.config.json` file undergoes multi-level validation:

1. **Basic Structure Validation** - Ensures config is a valid object
2. **Required Fields Validation** - Checks all mandatory fields are present
3. **Permissions Validation** - Validates permission structure and types
4. **Sizes Validation** - Ensures size specifications are correct

## Required Fields

### Core Fields (Requirements 5.1, 5.2)

All widgets must include these string fields:

```typescript
{
  "id": string,           // Unique widget identifier (non-empty)
  "name": string,         // Internal name (non-empty)
  "displayName": string,  // User-facing name (non-empty)
  "version": string,      // Semantic version (non-empty)
  "entryPoint": string    // Path to HTML entry file (non-empty)
}
```

### Optional Fields

```typescript
{
  "description": string,  // Widget description (optional)
  "author": {            // Author information (optional)
    "name": string,      // Author name
    "email": string      // Author email
  }
}
```

## Permissions Structure (Requirement 5.3)

The `permissions` object defines what system resources the widget can access:

```typescript
{
  "permissions": {
    "systemInfo": {
      "cpu": boolean,      // Access to CPU usage data
      "memory": boolean    // Access to memory usage data
    },
    "network": {
      "enabled": boolean,           // Network access enabled
      "allowedDomains": string[]    // Whitelist of allowed domains
    }
  }
}
```

### Validation Rules

- `permissions` must be an object
- `systemInfo` (if present) must be an object with boolean `cpu` and `memory` fields
- `network` (if present) must be an object
- `network.enabled` must be a boolean
- `network.allowedDomains` must be an array of non-empty strings

## Sizes Structure (Requirement 5.4)

The `sizes` object defines widget dimensions:

```typescript
{
  "sizes": {
    "default": {         // Required
      "width": number,   // Positive number
      "height": number   // Positive number
    },
    "min": {            // Optional
      "width": number,
      "height": number
    },
    "max": {            // Optional
      "width": number,
      "height": number
    }
  }
}
```

### Validation Rules

- `sizes` must be an object
- `sizes.default` is required and must contain positive `width` and `height` numbers
- `sizes.min` and `sizes.max` are optional but must follow the same structure if present
- All width and height values must be positive numbers

## Example Valid Configuration

```json
{
  "id": "com.example.clock",
  "name": "clock",
  "displayName": "Digital Clock",
  "description": "A simple digital clock widget",
  "version": "1.0.0",
  "entryPoint": "index.html",
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "permissions": {
    "systemInfo": {
      "cpu": false,
      "memory": false
    },
    "network": {
      "enabled": false,
      "allowedDomains": []
    }
  },
  "sizes": {
    "default": {
      "width": 300,
      "height": 150
    },
    "min": {
      "width": 200,
      "height": 100
    },
    "max": {
      "width": 600,
      "height": 300
    }
  }
}
```

## Validation Methods

### `validateWidgetConfig(config: any): boolean`

Main validation method that orchestrates all validation checks.

**Returns:** `true` if config is valid, `false` otherwise

**Checks:**
- Config is an object
- All required string fields are present and non-empty
- Optional description is a string (if present)
- Author structure is valid (if present)
- Permissions structure is valid
- Sizes structure is valid

### `validatePermissions(permissions: any): boolean`

Validates the permissions object structure.

**Returns:** `true` if permissions are valid, `false` otherwise

**Checks:**
- Permissions is an object
- systemInfo structure (if present)
- network structure (if present)
- All boolean fields are actually booleans
- allowedDomains is an array of non-empty strings

### `validateSizes(sizes: any): boolean`

Validates the sizes object structure.

**Returns:** `true` if sizes are valid, `false` otherwise

**Checks:**
- Sizes is an object
- default size is present and valid
- min and max sizes are valid (if present)

### `validateSizeObject(sizeObj: any, fieldName: string, required: boolean): boolean`

Helper method to validate individual size objects.

**Parameters:**
- `sizeObj` - The size object to validate
- `fieldName` - Name for error messages
- `required` - Whether this size object is required

**Returns:** `true` if size object is valid, `false` otherwise

**Checks:**
- Size object exists (if required)
- width is a positive number
- height is a positive number

## Error Handling

When validation fails:

1. **Console Logging**: Specific error messages are logged to help developers identify issues
2. **Widget Rejection**: Invalid widgets are not loaded into the system
3. **Graceful Degradation**: Other valid widgets continue to load normally

Example error messages:
```
Widget config missing or invalid required field: displayName
Widget config permissions.network.allowedDomains must be an array
Widget config sizes.default.width must be a positive number
```

## Testing

Test the validation system:

```bash
# Run validation tests
node test-config-validation.js

# Test with invalid config
node test-validation-demo.js
```

## Security Implications

Proper validation ensures:

- **No Malformed Configs**: Prevents crashes from unexpected data types
- **Permission Enforcement**: Only declared permissions can be requested
- **Size Constraints**: Prevents widgets from creating oversized windows
- **Domain Whitelisting**: Network access is restricted to declared domains

## Best Practices

When creating widget configurations:

1. **Always include all required fields** - Missing fields will cause rejection
2. **Use semantic versioning** - Helps with future update mechanisms
3. **Declare minimal permissions** - Only request what you need
4. **Set reasonable default sizes** - Consider user screen space
5. **Provide clear descriptions** - Helps users understand widget purpose
6. **Validate locally** - Test your config before distribution

## Related Documentation

- [State Management](./state-management.md) - Widget state persistence
- Widget SDK Documentation - Creating widgets with the SDK
- Security Documentation - Permission system details
