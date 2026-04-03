import { cn } from '../lib/cn.js'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl border-2 border-[#D4A574]/40 bg-[#1a1a1a]/50 backdrop-blur-sm px-3 text-sm text-white shadow-md outline-none placeholder:text-[#8a8a8a] focus:border-[#D4A574] focus:ring-2 focus:ring-[#D4A574]/30 transition-all duration-300',
        className,
      )}
      {...props}
    />
  )
}

