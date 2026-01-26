import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-white to-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            LinkGen
          </div>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">Log in</Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
            Smart Redirects for <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">WhatsApp</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create permanent <strong>/w/slug</strong> links for your business.
            Change your WhatsApp number anytime without changing the link.
            Perfect for ads, profiles, and printed materials.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-8 py-4 text-lg shadow-xl shadow-indigo-500/30 hover:scale-105 transition-transform">
                Start Free Trial
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-400 pt-8">
            Disclaimer: This service is not affiliated with WhatsApp Inc.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} LinkGen. All rights reserved.
      </footer>
    </div>
  );
}
