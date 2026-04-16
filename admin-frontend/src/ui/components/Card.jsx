import { cn } from '../lib/cn.js'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-3xl border-2 border-[#D4A574]/40 bg-gradient-to-br from-[#2d2d2d]/80 to-[#1a1a1a]/80 shadow-2xl backdrop-blur-sm hover:border-[#D4A574]/60 transition-all duration-300', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('border-b border-[#D4A574]/20 px-5 py-4', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <div className={cn('text-sm font-bold text-white tracking-wide', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

