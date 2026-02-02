# Modern Dashboard Architecture for Cartpanda

## Executive Summary

Building a scalable admin dashboard requires balancing speed, maintainability, and team productivity. This architecture prioritizes feature isolation, consistent UX patterns, and incremental improvements over big rewrites.

## 1. Architecture

### Route & Page Structure
```
src/
├── app/                    # App shell, providers, routing
├── features/              # Feature-based modules
│   ├── funnels/          # Funnel management
│   ├── orders/           # Order processing  
│   ├── customers/        # Customer data
│   ├── subscriptions/    # Subscription handling
│   ├── analytics/        # Reporting & metrics
│   └── settings/         # Configuration
├── shared/               # Cross-cutting concerns
│   ├── components/       # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Helper functions
│   └── types/           # Shared TypeScript types
└── lib/                 # External integrations
```

### Feature Module Pattern
Each feature owns its complete vertical slice:
```typescript
features/orders/
├── components/           # Feature-specific UI
├── hooks/               # Data fetching & state
├── pages/               # Route components
├── types.ts             # Domain types
├── api.ts               # API layer
└── index.ts             # Public exports
```

**Benefits:**
- Clear ownership boundaries
- Easy to delete/refactor features
- Parallel development without conflicts
- Natural code splitting points

### Routing Strategy
- **Primary: Next.js App Router** for file-based routing and RSC
  - Server components for initial data loading
  - Middleware for authentication checks
  - Built-in optimization and caching
- **Alternative: Vite + React Router v6** (for simpler deployment)
  - Faster dev server, smaller bundle
  - Client-side only (suitable for admin dashboards)
  - Manual auth guards with HOCs

**Recommendation: Start with Vite + React Router for faster iteration, migrate to Next.js when SSR benefits are needed.**

## 2. Design System

### Component Library Strategy: Build + Buy Hybrid
- **Base layer:** Radix UI primitives for accessibility
- **Custom layer:** Cartpanda-specific components  
- **Utility layer:** Tailwind CSS for styling

**Specific Choice: Radix UI + Tailwind**
- Radix provides unstyled, accessible primitives (Dialog, Dropdown, etc.)
- Tailwind handles all styling with design tokens
- Custom wrapper components for Cartpanda branding
- Estimated 60% faster than building from scratch

```typescript
// Example component structure
components/
├── ui/                  # Base primitives (Button, Input, etc.)
├── patterns/            # Composite patterns (DataTable, FormField)
├── layouts/             # Page layouts and shells
└── domain/              # Business-specific components
```

### Design Tokens & Consistency
- **CSS Custom Properties** for theme values
- **Tailwind config** as single source of truth
- **Design tokens package** for cross-platform consistency
- **Storybook** for component documentation and testing

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--color-brand-50)',
          500: 'var(--color-brand-500)',
          900: 'var(--color-brand-900)',
        }
      }
    }
  }
}
```

### Accessibility Standards
- **WCAG 2.1 AA compliance** as baseline
- **Automated testing** with axe-core in CI
- **Focus management** for SPAs
- **Screen reader testing** in development workflow

## 3. Data Fetching & State

### Server State: TanStack Query + Zod Validation
```typescript
// Centralized query management with runtime validation
const useOrders = (filters: OrderFilters) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const response = await ordersApi.getOrders(filters);
      return OrdersSchema.parse(response); // Runtime validation
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (dashboards need fresher data)
    retry: 2, // Conservative retry for admin dashboards
    retryDelay: 1000, // Fixed 1s delay
    refetchOnWindowFocus: false, // Prevent excessive requests
  });
};
```

**Why TanStack Query:**
- Built-in caching, background updates, optimistic updates
- Handles loading/error states automatically
- Perfect for dashboard data patterns
- Reduces boilerplate vs Redux + RTK Query

**API Layer Strategy:**
- **REST APIs** for CRUD operations (orders, customers)
- **GraphQL** for complex analytics queries (optional)
- **WebSocket/SSE** for real-time updates (order status, notifications)

### Client State: Zustand + Context + URL State
- **Zustand** for global app state (user session, preferences, theme)
- **React Context** for feature-scoped state (form data, local UI state)
- **URL state** for shareable state (filters, pagination, sorts)
- **Local Storage** for user preferences and draft data

**Authentication & Authorization:**
```typescript
// JWT-based auth with refresh tokens
const useAuth = () => {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authApi.getCurrentUser(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: false, // Don't retry auth failures
  });
};

// Role-based access control
const usePermissions = (resource: string, action: string) => {
  const { data: user } = useAuth();
  return user?.permissions?.[resource]?.includes(action) ?? false;
};
```

### Loading & Error Patterns
```typescript
// Consistent loading states
const OrdersPage = () => {
  const { data, isLoading, error } = useOrders(filters);
  
  if (isLoading) return <OrdersTableSkeleton />;
  if (error) return <ErrorBoundary error={error} />;
  if (!data?.length) return <EmptyState />;
  
  return <OrdersTable data={data} />;
};
```

### Table State Management
- **URL-driven state** for filters, sorts, pagination
- **Optimistic updates** for quick interactions
- **Background refetching** for real-time data
- **Infinite queries** for large datasets

## 4. Performance

### Bundle Optimization
- **Route-based code splitting** with React.lazy
- **Feature-based chunks** aligned with team ownership
- **Shared vendor chunks** for common dependencies
- **Tree shaking** with ES modules

### Runtime Performance
- **React.memo** for expensive list items and complex components
- **Virtual scrolling** for large tables (react-window or @tanstack/react-virtual)
- **Debounced search** with AbortController for request cancellation
- **Image optimization** with lazy loading and WebP format
- **Code splitting** at route and feature level
- **Service Worker** for offline functionality and caching

### Performance Monitoring
```typescript
// Core Web Vitals tracking (updated metrics)
import { getCLS, getINP, getFCP, getLCP, getTTFB } from 'web-vitals';

const sendToAnalytics = (metric: any) => {
  // Send to your analytics service
  analytics.track('web-vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
  });
};

getCLS(sendToAnalytics);
getINP(sendToAnalytics); // Replaces FID
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

**Key Performance Targets:**
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Interaction to Next Paint (INP)**: < 200ms  
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to First Byte (TTFB)**: < 800ms
- **Custom: Time to Data**: < 1.5s for dashboard pages

## 5. Developer Experience & Team Scaling

### Onboarding & Documentation
- **Architecture Decision Records (ADRs)** for major choices
- **Component playground** in Storybook
- **Feature templates** with Plop.js generators
- **Video walkthroughs** for complex patterns

### Code Quality & Conventions
```json
// .eslintrc.js - Key rules for team consistency
{
  "extends": ["@typescript-eslint/recommended", "prettier"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "import/order": ["error", { "groups": ["builtin", "external", "internal"] }],
    "react-hooks/exhaustive-deps": "error",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

**Enforced Conventions:**
- Prettier for formatting (no debates)
- Husky + lint-staged for pre-commit hooks
- Conventional commits for changelog generation
- TypeScript strict mode enabled

### Team Collaboration
- **Feature flags** for gradual rollouts
- **PR templates** with architecture checklist
- **Design system reviews** for new components
- **Cross-team RFC process** for breaking changes

### Preventing Technical Debt
- **Automated dependency updates** with Renovate
- **Bundle size monitoring** in CI
- **Performance budgets** with Lighthouse CI
- **Regular architecture reviews** (monthly)

## 6. Testing Strategy

### Testing Pyramid
```typescript
// Unit Tests (70%) - Business logic, utilities
describe('orderCalculations', () => {
  it('calculates total with tax correctly', () => {
    expect(calculateOrderTotal(order)).toBe(expectedTotal);
  });
});

// Integration Tests (20%) - Component + API interactions  
test('orders table loads and filters correctly', async () => {
  render(<OrdersPage />);
  await waitFor(() => expect(screen.getByText('Order #1001')).toBeInTheDocument());
});

// E2E Tests (10%) - Critical user journeys
test('admin can create and publish funnel', async ({ page }) => {
  await page.goto('/funnels/new');
  // ... test critical path
});
```

### Minimum Testing Requirements
- **Unit tests** for all business logic
- **Component tests** for complex interactions
- **API integration tests** for data flows
- **E2E tests** for core user journeys
- **Visual regression tests** for design system

## 7. Release & Quality

### Deployment Strategy
- **Feature flags** with LaunchDarkly/Unleash
- **Staged rollouts** (5% → 25% → 100%)
- **Canary deployments** with automatic rollback
- **Blue-green deployments** for zero downtime

### Monitoring & Observability
```typescript
// Error tracking with context
Sentry.withScope((scope) => {
  scope.setTag('feature', 'orders');
  scope.setUser({ id: user.id, role: user.role });
  scope.setContext('order', { id: orderId, status });
  Sentry.captureException(error);
});
```

### Quality Gates
- **Automated testing** in CI/CD pipeline
- **Performance budgets** enforced in builds
- **Accessibility audits** with axe-core
- **Security scanning** with Snyk/OWASP

### Ship Fast but Safe Philosophy
1. **Feature flags** enable quick rollbacks
2. **Monitoring alerts** catch issues early  
3. **Gradual rollouts** limit blast radius
4. **Automated rollbacks** on error thresholds
5. **Blameless postmortems** improve processes

## Implementation Timeline

**Month 1-2: Foundation & Authentication**
- Week 1-2: Project setup, build tooling, design system foundation
- Week 3-4: Authentication system, user management, role-based access
- Week 5-6: Core layout, navigation, basic data fetching patterns
- Week 7-8: Orders module (highest business value)

**Month 3-4: Core Features**  
- Week 9-10: Customers module and basic analytics
- Week 11-12: Funnels management (complex UI interactions)
- Week 13-14: Subscriptions and billing integration
- Week 15-16: Settings, permissions, and user preferences

**Month 5-6: Advanced Features & Production**
- Week 17-18: Advanced analytics, reporting, data visualization
- Week 19-20: Disputes handling, advanced workflows
- Week 21-22: Performance optimization, testing coverage
- Week 23-24: Security audit, accessibility compliance, deployment

**Key Milestones:**
- Week 8: MVP with authentication + orders (internal testing)
- Week 16: Feature-complete dashboard (user acceptance testing)
- Week 24: Production-ready with full monitoring and documentation

**Risk Mitigation:**
- 20% buffer time built into each phase
- Weekly architecture reviews to prevent technical debt
- Feature flags for safe rollouts of complex features
- Parallel development tracks after week 8

This architecture balances immediate productivity with long-term maintainability, ensuring the dashboard can evolve with Cartpanda's growth while maintaining high quality standards.