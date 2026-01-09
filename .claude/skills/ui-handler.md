# UI Handler Skill (Component Generation)

---
## 🎯 CRITICAL: Read Project Context First

**Before generating ANY code:**
1. ✅ Read `.claude/PROJECT_CONTEXT.md` for master rules
2. ✅ Check `src/config/brand.ts` for project name and branding
3. ✅ Use `brand.name` dynamically, NEVER hardcode project names

---

## Trigger
When user says: "Create a [component type]" or "Build [UI element]" or "Add [widget]"

## What This Skill Does
Generates production-ready React components using:
1. shadcn/ui base components
2. Tailwind CSS styling
3. **Dynamic project branding** (from `brand.ts`)
4. TypeScript interfaces
5. Proper accessibility (WCAG 2.1 AA)

---

## Available shadcn/ui Components

This boilerplate includes pre-installed shadcn/ui components:

```
Button, Input, Label, Textarea
Card, Dialog, Sheet, Drawer
Table, Tabs, Accordion
Select, Checkbox, Radio
Toast, Alert, Badge
Avatar, Dropdown, Popover
Form (react-hook-form integration)
Skeleton, Progress, Separator
```

All located in: `@/components/ui/`

---

## Component Templates

### Dashboard Stat Card

```typescript
// src/components/dashboard/stat-card.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend,
  className 
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "text-xs mt-2 flex items-center gap-1",
            trend.isPositive ? "text-green-500" : "text-red-500"
          )}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Usage:**
```typescript
import { StatCard } from '@/components/dashboard/stat-card';
import { Users, DollarSign } from 'lucide-react';

<StatCard
  title="Total Users"
  value="1,234"
  icon={Users}
  trend={{ value: 12, isPositive: true }}
/>
```

---

### Data Table Component

```typescript
// src/components/ui/data-table.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKey,
  pageSize = 10,
  emptyMessage = "No data available"
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search
  const filteredData = searchKey && searchTerm
    ? data.filter(item =>
        String(item[searchKey])
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : data;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
      {/* Search */}
      {searchKey && (
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : String(row[column.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Pricing Card (Dynamic Branding)

```typescript
// src/components/pricing/pricing-card.tsx
'use client';

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { brand } from '@/config/brand'; // ✅ Import brand config

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText?: string;
  onSelect: () => void;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  popular = false,
  buttonText = 'Get Started',
  onSelect,
}: PricingCardProps) {
  return (
    <Card className={cn(
      'relative flex flex-col',
      popular && 'border-primary shadow-lg'
    )}>
      {popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      
      <CardHeader className="text-center pb-2">
        <h3 className="text-xl font-bold">{name}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="text-center mb-6">
          <span className="text-4xl font-bold">
            {brand.pricing.currencySymbol}{price.toLocaleString('en-IN')}
          </span>
          <span className="text-muted-foreground"> one-time</span>
        </div>
        
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={onSelect} 
          className="w-full"
          variant={popular ? 'default' : 'outline'}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

### Form with react-hook-form + Zod

```typescript
// src/components/forms/example-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { brand } from '@/config/brand';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export function ExampleForm() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Request failed');

      toast({ 
        title: `${brand.name} Success`, 
        description: 'Form submitted successfully' 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

---

### Empty State

```typescript
// src/components/ui/empty-state.tsx
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
```

---

### Loading Skeleton

```typescript
// src/components/ui/loading-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-md border">
      <div className="border-b p-4">
        <Skeleton className="h-4 w-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b p-4 flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
```

---

## Common Patterns

### Loading States
```typescript
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
) : (
  <YourComponent />
)}
```

### Error States
```typescript
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error.message}</AlertDescription>
  </Alert>
)}
```

### Toast Notifications (with Brand)
```typescript
import { useToast } from '@/hooks/use-toast';
import { brand } from '@/config/brand';

const { toast } = useToast();

// Success
toast({ 
  title: `${brand.name} Success`,
  description: 'Action completed successfully' 
});

// Error
toast({ 
  title: 'Error',
  description: 'Something went wrong',
  variant: 'destructive'
});
```

---

## Component Generation Guidelines

### 1. Always Import Brand Config When Needed
```typescript
import { brand } from '@/config/brand';
```

### 2. Use Proper TypeScript Types
```typescript
interface ComponentProps {
  title: string;
  description?: string; // Optional
  children?: React.ReactNode;
  className?: string;
}
```

### 3. Naming Conventions
- Component files: `kebab-case.tsx`
- Component names: `PascalCase`
- Props interfaces: `ComponentNameProps`

### 4. Accessibility
- Add ARIA labels
- Support keyboard navigation
- Include focus states
- Use semantic HTML

### 5. Responsive Design
- Mobile-first approach
- Tailwind responsive prefixes: `md:`, `lg:`, `xl:`

---

## Styling Best Practices

### Use cn() for Conditional Classes
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  condition && "conditional-class",
  className
)} />
```

### Follow Tailwind Patterns
```typescript
// Spacing
<div className="space-y-4 p-6" />

// Flexbox
<div className="flex items-center justify-between gap-4" />

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
```

---

## Usage Examples

**User:** "Create a dashboard stats widget"

**Claude generates:** StatCard component with icon, value, trend indicator, and dynamic branding from `brand.ts`

**User:** "Build a pricing table"

**Claude generates:** PricingCard components using `brand.pricing.currencySymbol` and `brand.name` automatically

**User:** "Add a contact form"

**Claude generates:** Form with react-hook-form, Zod validation, toast notifications using `brand.name` in success messages

---

## Important Reminders

1. **Dynamic Branding**: Always use `brand.*` values, never hardcode
2. **TypeScript**: Strict types, no `any`
3. **Accessibility**: WCAG 2.1 AA compliant
4. **Responsiveness**: Test on mobile, tablet, desktop
5. **Error Handling**: Always handle errors gracefully
6. **Loading States**: Show feedback during async operations

---

**Remember:** Generate components that work for ANY project name, not just one! 🎨
