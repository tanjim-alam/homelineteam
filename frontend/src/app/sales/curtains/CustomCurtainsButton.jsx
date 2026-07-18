'use client'

import { Scissors } from 'lucide-react'

const openModal = () => window.dispatchEvent(new CustomEvent('openLeadModal'))

export default function CustomCurtainsButton() {
  return (
    <button
      onClick={openModal}
      className="fixed bottom-6 right-5 z-[9990] flex items-center gap-2
        bg-[#1a3c6e] hover:bg-[#0d1f3b] active:scale-95
        text-white font-bold text-sm px-5 py-3 rounded-full
        shadow-lg shadow-[#0d1f3b]/40 hover:shadow-xl hover:shadow-[#0d1f3b]/50
        transition-all duration-200 hover:-translate-y-0.5 select-none"
      aria-label="Book custom curtains"
    >
      <Scissors className="w-4 h-4 flex-shrink-0" />
      Custom Curtains
    </button>
  )
}
