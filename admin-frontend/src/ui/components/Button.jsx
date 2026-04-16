import { cn } from '../lib/cn.js'

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}) {
  const variants = {
    primary:
      'bg-gradient-to-r from-[#D4A574] to-[#C59868] text-[#1a1a1a] hover:shadow-lg hover:scale-105 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A574] font-semibold transition-all duration-300',
    secondary:
      'bg-[#2d2d2d] text-white border-2 border-[#D4A574]/50 hover:border-[#D4A574] hover:shadow-lg shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A574] transition-all duration-300',
    danger:
      'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-lg hover:scale-105 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-all duration-300',
    ghost:
      'bg-transparent text-[#D4A574] hover:bg-[#D4A574]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A574] transition-all duration-300',
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm rounded-lg',
    md: 'h-10 px-4 text-sm rounded-xl',
    lg: 'h-11 px-5 text-base rounded-xl',
  }

  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

