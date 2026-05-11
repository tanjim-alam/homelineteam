import { Home } from 'lucide-react'

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">

          {/* Dark navy header — matches login/register */}
          <div className="px-8 py-7 flex items-center gap-4" style={{ backgroundColor: '#1a2035' }}>
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">HomelineTeam</p>
              <p className="text-slate-400 text-sm">Admin Panel</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-10 flex flex-col items-center text-center">
            {/* Spinner */}
            <div className="relative w-12 h-12 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            </div>

            <p className="text-base font-semibold text-gray-800">Verifying your session</p>
            <p className="text-sm text-gray-400 mt-1">Please wait a moment…</p>
          </div>
        </div>
      </div>
    </div>
  )
}
