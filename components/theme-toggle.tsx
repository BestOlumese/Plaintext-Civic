"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-full w-[76px] h-9">
        <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center">
            <Sun className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    )
  }

  return (
    <div 
      className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-full cursor-pointer transition-all duration-300 relative h-9 w-[68px]"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Active Indicator Background */}
      <div 
        className="absolute left-1 w-7 h-7 rounded-full bg-white dark:bg-slate-500 shadow-sm transition-transform duration-300 ease-in-out"
        style={{ transform: resolvedTheme === "dark" ? "translateX(32px)" : "translateX(0)" }}
      />
      
      <div className="relative z-10 flex items-center justify-between w-full px-1">
        <div className={cn(
          "w-7 h-7 flex items-center justify-center transition-all duration-300",
          resolvedTheme === "light" ? "text-amber-500" : "text-slate-400"
        )}>
          <Sun className="h-4 w-4" />
        </div>
        <div className={cn(
          "w-7 h-7 flex items-center justify-center transition-colors duration-300",
          resolvedTheme === "dark" ? "text-blue-400" : "text-slate-500"
        )}>
          <Moon className="h-4 w-4" />
        </div>
      </div>
      <span className="sr-only">Toggle theme</span>
    </div>
  )
}
