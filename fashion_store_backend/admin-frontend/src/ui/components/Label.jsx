import { cn } from '../lib/cn.js'

export function Label({ className, ...props }) {
  return <label className={cn('text-sm font-semibold text-[#D4A574] tracking-wide', className)} {...props} />
}

