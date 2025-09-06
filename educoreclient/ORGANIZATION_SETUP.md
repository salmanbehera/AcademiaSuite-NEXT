# Organization & Branch Configuration Guide

## Current Setup

Your AcademiaSuite application now has a centralized organization and branch ID management system that will eventually integrate with JWT tokens for automatic user-specific configuration.

## How It Works

### 1. **Central Context** (`contexts/OrganizationContext.tsx`)
- Manages `organizationId` and `branchId` across the entire application
- Currently uses localStorage for persistence
- Ready for JWT token integration

### 2. **Service Layer** (`services/classService.ts`)
- No longer requires manual organization/branch ID passing
- IDs are automatically injected by the hooks

### 3. **Hooks** (`hooks/useClasses.ts`)
- Automatically includes organization/branch IDs in all API calls
- Uses `withOrgData()` helper to inject IDs into payloads

### 4. **API Calls**
- All API calls now automatically include the correct organization and branch IDs
- No need to manually pass these values in component code

## Current Configuration

### Default Values (Temporary)
```typescript
// In lib/config.ts
export const DEFAULT_ORG_CONFIG = {
  organizationId: "ed5dcc55-d809-452c-bfba-eabb3160cd5d",
  branchId: "8ee14d76-ba65-40d5-82ce-7483dc51086a",
} as const;
```

### Environment Variables (Optional)
You can override defaults using environment variables:

```bash
# .env.local
NEXT_PUBLIC_DEFAULT_ORG_ID=your-organization-id-here
NEXT_PUBLIC_DEFAULT_BRANCH_ID=your-branch-id-here
```

## Usage in Components

### Before (Manual ID Management)
```typescript
const { organizationId, branchId } = useOrganization();
const { classes, updateClass } = useClasses(organizationId, branchId);

// Had to manually include IDs
await updateClass(id, {
  ...classData,
  organizationId,
  branchId,
});
```

### After (Automatic ID Management)
```typescript
const { classes, updateClass } = useClasses();

// IDs are automatically included
await updateClass(id, classData);
```

## Configuration Panel

The Class Master page now includes an Organization Configuration panel where you can:
- View current organization and branch IDs
- Temporarily change them for testing
- See how they will work with JWT tokens in the future

## Future JWT Integration

When JWT tokens are implemented, the system will:

1. **Extract IDs from Token**
```typescript
// From JWT payload
{
  "userId": "user-id",
  "organizationId": "org-id",
  "branchId": "branch-id",
  "role": "admin",
  "exp": 1234567890
}
```

2. **Automatic Updates**
- Organization context will automatically update when token changes
- All API calls will use the token-based IDs
- No component code changes required

3. **Multi-Organization Support**
- Users can switch between organizations
- Branch selection based on permissions
- Secure role-based access control

## Testing the Setup

1. **View Current Configuration**
   - Go to Class Master page
   - Check the Organization Configuration panel
   - See current org/branch IDs

2. **Change Configuration**
   - Click "Configure" in the panel
   - Enter new organization/branch IDs
   - Save changes and test API calls

3. **Verify API Calls**
   - Create/update/delete classes
   - Check network tab to see IDs in payloads
   - Confirm 405 errors are resolved

## Benefits

✅ **Centralized Management** - Single source of truth for org/branch IDs
✅ **Future-Ready** - Easy JWT integration when ready
✅ **Clean Components** - No manual ID management in UI code
✅ **Type Safety** - Full TypeScript support with validation
✅ **Error Prevention** - Automatic validation and error handling
✅ **Easy Testing** - Configuration panel for quick testing

## Next Steps

1. **Test Current Setup** - Verify all API calls work with centralized IDs
2. **JWT Implementation** - Add JWT token parsing when authentication is ready
3. **Multi-Org Support** - Add organization switching when needed
4. **Role-Based Access** - Implement branch permissions based on user roles
