import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../../modules/cache/cache.service';

/**
 * Maps controller URL paths to cache key prefixes for automatic invalidation.
 * When a POST/PUT/PATCH/DELETE request succeeds, this interceptor clears
 * all Redis cache keys that match the related resource prefix.
 */
const RESOURCE_CACHE_MAP: Record<string, string[]> = {
  '/orders': ['orders:*', 'order:*'],
  '/customer/orders': ['customer-orders:*', 'orders:*', 'order:*'],
  '/cart': ['cart:*'],
  '/customer/cart': ['cart:*'],
  '/tables': ['tables:*', 'table:*'],
  '/customers': ['customers:*', 'customer:*'],
  '/items': ['items:*', 'item:*'],
  '/categories': ['categories:*', 'category:*'],
  '/discounts': ['discounts:*', 'discount:*'],
  '/expenses': ['expenses:*', 'expense:*'],
  '/expense-categories': ['expense-categories:*', 'expense-category:*'],
  '/reservations': ['reservations:*', 'reservation:*'],
  '/reports': ['reports:*', 'report:*', 'sales-reports:*', 'sales-report:*'],
  '/sales-reports': ['reports:*', 'report:*', 'sales-reports:*', 'sales-report:*'],
  '/public': ['public:*', 'website-content:*', 'website:*'],
  '/website-content': ['website-content:*', 'website:*', 'public:*'],
  '/settings': ['settings:*', 'setting:*'],
  '/users': ['users:*', 'user:*'],
  '/permissions': ['permissions:*', 'permission:*'],
  '/roles': ['roles:*', 'role:*'],
  '/staff-salary': ['staff-salary:*', 'salary:*'],
  '/stuff-attendance': ['stuff-attendance:*', 'attendance:*'],
  '/stuff-leave': ['stuff-leave:*', 'leave:*'],
  '/activities': ['activities:*', 'activity:*'],
  '/kitchen-items': ['kitchen-items:*', 'kitchen-item:*'],
  '/kitchen-stock': ['kitchen-stock:*', 'kitchen:*'],
  '/kitchen-reports': ['kitchen-reports:*', 'kitchen-report:*'],
  '/data-management': ['data-management:*', 'backup:*'],
  '/whatsapp': ['whatsapp:*'],
  '/sms': ['sms:*'],
  '/contact-messages': ['contact-messages:*', 'contact:*'],
  '/blog': ['blog:*', 'posts:*', 'post:*'],
  '/partners': ['partners:*', 'partner:*'],
  '/auth': ['auth:*', 'me:*'],
};

function extractResourcePrefix(path: string): string | null {
  // Normalize path: remove trailing slash, query params
  const cleanPath = path.split('?')[0].replace(/\/$/, '');

  // Try exact match first
  if (RESOURCE_CACHE_MAP[cleanPath]) {
    return cleanPath;
  }

  // Try matching by first two segments after any prefix
  // e.g. /api/v1/orders/123 → /orders
  const segments = cleanPath.split('/').filter(Boolean);

  // Remove 'api' and 'v1' if present at the start
  let startIdx = 0;
  if (segments[0] === 'api') startIdx = 1;
  if (segments[startIdx]?.startsWith('v')) startIdx += 1;

  // Try progressively shorter paths
  for (let i = segments.length; i > startIdx; i--) {
    const candidate = '/' + segments.slice(startIdx, i).join('/');
    if (RESOURCE_CACHE_MAP[candidate]) {
      return candidate;
    }
  }

  return null;
}

@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only intercept mutating HTTP methods
    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (!mutatingMethods.includes(method)) {
      return next.handle();
    }

    // Skip auth-only mutations that shouldn't clear app data caches
    if (request.path?.includes('/auth/') && method === 'POST') {
      return next.handle();
    }

    const resourcePrefix = extractResourcePrefix(request.path);
    const patterns = resourcePrefix ? RESOURCE_CACHE_MAP[resourcePrefix] : null;

    if (!patterns || patterns.length === 0) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // Defer cache invalidation to the next tick so it doesn't block
        // the event loop immediately after the HTTP response is sent.
        setImmediate(async () => {
          try {
            for (const pattern of patterns) {
              await this.cacheService.delete(pattern);
            }
          } catch (error) {
            // Silently fail cache invalidation so the mutation still succeeds
          }
        });
      }),
    );
  }
}
