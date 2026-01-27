
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Zap, BarChart3, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <span className="text-xl font-bold tracking-tight text-gray-900">LinkGen</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Log in</Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-600 shadow-sm mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-green-50 mr-2"></span>
              v1.0 is now live
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-4xl mx-auto leading-[1.1]">
              Generate WhatsApp Links <br className="hidden md:block" />
              <span className="text-gray-400">That Convert.</span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Create smart, trackable WhatsApp links for your business.
              Analyze clicks, manage redirects, and grow your audience with a premium tool designed for professionals.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-gray-200">Start Free Trial</Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="h-12 px-8 text-base">View Demo</Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-400">No credit card required. Cancel anytime.</p>
          </div>

          {/* Subtle Background Decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[1000px] h-[500px] opacity-30 bg-gradient-to-tr from-indigo-100 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        </div>

        {/* Feature Grid */}
        <section className="bg-white py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                  <Zap className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Instant Redirects</h3>
                <p className="text-gray-500 leading-relaxed">
                  Fast, server-side redirection ensuring you never lose a potential customer due to load times.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                  <BarChart3 className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Click Analytics</h3>
                <p className="text-gray-500 leading-relaxed">
                  Track every click. Know exactly how your links are performing with our built-in dashboard.
                </p>
              </div>
              <div className="space-y-4">
                <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                  <ShieldCheck className="w-5 h-5 text-gray-900" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Enterprise Security</h3>
                <p className="text-gray-500 leading-relaxed">
                  Bank-grade security with role-based access control and secure API routes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-sm text-gray-500">
          <p>© 2024 LinkGen Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
