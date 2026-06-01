import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';

/**
 * Extracts the Tenant ID from the request context to ensure multi-tenant isolation.
 * Throws an error if the tenant ID is missing or invalid to prevent cross-tenant data leaks.
 */
export async function getTenantId(): Promise<string> {
  // Option 1: Extract from NextAuth session
  try {
    const session = await getServerSession();
    if (session?.user && (session as any).tenantId) {
      return (session as any).tenantId;
    }
  } catch (error) {
    // Context might not support getServerSession (e.g. some edge API routes)
  }

  // Option 2: Extract from Headers (for API requests / internal services)
  try {
    const headersList = await headers();
    const tenantIdHeader = headersList.get('x-tenant-id');
    
    if (tenantIdHeader) {
      return tenantIdHeader;
    }
  } catch (error) {
    // If headers() is called outside of request context
  }

  // If no tenant is identified, strictly deny access
  throw new Error('UNAUTHORIZED_TENANT_ACCESS: Unable to determine tenant context. Cross-tenant data access blocked.');
}
