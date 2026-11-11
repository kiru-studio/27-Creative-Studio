import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex min-h-[var(--control-height)] shrink-0 items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-control)] border border-[var(--line)] bg-transparent px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-sm)] font-semibold text-[var(--paper)] whitespace-nowrap transition-colors duration-[var(--motion-fast)] select-none hover:border-[var(--industry)] hover:text-[var(--industry)] focus-visible:border-[var(--industry)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-[var(--industry)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--icon-size)]",
  {
    variants: {
      variant: {
        default: 'border-[var(--industry)] bg-[var(--industry)] text-[var(--ink)] hover:bg-transparent hover:text-[var(--industry)]',
        outline: 'border-[var(--line)] bg-transparent text-[var(--paper)]',
        secondary: 'border-[var(--line)] bg-[var(--panel)] text-[var(--paper)]',
        ghost: 'border-transparent bg-transparent text-[var(--paper)]',
        destructive: 'border-[var(--industry)] text-[var(--industry)] hover:bg-[var(--industry)] hover:text-[var(--ink)]',
        link: 'min-h-0 border-transparent bg-transparent px-0 py-0 text-[var(--industry)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-[var(--control-height)]',
        xs: 'min-h-[var(--control-height-compact)] rounded-[var(--radius-control)] px-[var(--space-2)] text-[length:var(--text-xs)]',
        sm: 'min-h-[var(--control-height)] px-[var(--space-3)]',
        lg: 'min-h-[var(--control-height-large)] px-[var(--space-5)] text-[length:var(--text-base)]',
        icon: 'size-[var(--control-height)] p-0',
        'icon-xs': 'size-[var(--control-height-compact)] p-0',
        'icon-sm': 'size-[var(--control-height)] p-0',
        'icon-lg': 'size-[var(--control-height-large)] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
