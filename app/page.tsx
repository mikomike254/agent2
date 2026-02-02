'use client';

import Link from 'next/link';
import { Star, Play, Zap, TrendingUp, Users, MessageSquare, ChevronRight, Check, Shield, Code, Rocket } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <nav className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center text-white text-lg">
              C
            </div>
            <span>creative.ke</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-700">
            <Link href="/how-it-works" className="hover:text-black">How It Works</Link>
            <Link href="/jobs" className="hover:text-black font-semibold text-indigo-600">Explore Jobs</Link>
            <Link href="/join" className="hover:text-black">Join as Commissioner</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-black hidden sm:block">Log in</Link>
            <Link href="/signup" className="text-sm font-medium border border-black rounded-full px-5 py-2 hover:bg-black hover:text-white transition-colors">
              Get Started — It's Free
            </Link>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-[#dcdcdc] to-[#f0f0f0] rounded-[40px] p-8 md:p-16 lg:p-20 overflow-visible relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <span className="font-semibold">Trusted by 100+ Projects</span>
              </div>
              <div className="text-xs text-gray-600">Read Our <span className="underline cursor-pointer">Success Stories</span></div>

              <h1 className="font-serif text-7xl md:text-8xl lg:text-9xl font-bold leading-none tracking-tight">
                Build<sup className="text-5xl md:text-6xl">+</sup>
              </h1>

              <p className="text-lg text-gray-700 max-w-md leading-relaxed">
                Secure Development Projects With Escrow Protection — 43% Deposit, 110% Refund Guarantee.
              </p>

              <div className="flex items-center gap-3 pt-4">
                <img
                  src="https://images.pexels.com/photos/1037995/pexels-photo-1037995.jpeg?auto=compress&cs=tinysrgb&w=100"
                  alt="Client"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-sm">
                  <div className="text-gray-600">Trusted by clients</div>
                  <div className="font-semibold">100% Satisfaction</div>
                </div>
                <div className="ml-4 flex items-center gap-1 text-sm font-semibold">
                  <span>/</span>
                  <Star className="w-4 h-4 fill-black" />
                  <span>4.9</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link href="/jobs" className="bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                  Browse Jobs
                </Link>
                <Link href="/find-commissioner" className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors">
                  Find a Commissioner
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[420px]">
                <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-[#1f7a5a] to-[#14b8a6] rounded-[30px] overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/7752846/pexels-photo-7752846.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Corporate Professional"
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-black ml-1" />
                    </button>
                  </div>
                </div>

                <div className="absolute top-4 left-4 lg:-left-12 bg-white/40 backdrop-blur-md rounded-full px-5 py-3 shadow-lg border border-white/20 flex items-center gap-2 text-sm animate-float delay-100 hover:shadow-xl hover:bg-white/50 transition-all">
                  <div className="w-5 h-5 bg-[#1f7a5a] rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                  <span className="font-medium">Escrow Protected</span>
                </div>

                <div className="absolute top-24 left-8 lg:left-2 bg-white/40 backdrop-blur-md rounded-full px-5 py-3 shadow-lg border border-white/20 flex items-center gap-2 text-sm animate-float-slow delay-200 hover:shadow-xl hover:bg-white/50 transition-all">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                  <span className="font-medium">Verified Developers</span>
                </div>

                <div className="absolute top-8 -right-4 lg:-right-8 bg-white/40 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 w-36 animate-float-slower delay-300 hover:shadow-xl hover:bg-white/50 transition-all animate-glow-pulse">
                  <div className="text-[10px] text-gray-600 mb-1">— GUARANTEED</div>
                  <div className="text-4xl font-bold mb-1">110%</div>
                  <div className="text-xs text-gray-700">Refund if we fail</div>
                </div>

                <div className="absolute bottom-12 -right-4 lg:right-0 bg-white/40 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20 w-44 animate-float delay-400 hover:shadow-xl hover:bg-white/50 transition-all">
                  <Code className="w-full h-20 text-[#1f7a5a] mb-2" />
                  <div className="font-semibold text-sm">Web & Mobile Apps</div>
                  <div className="text-xs text-gray-600">Full-Stack Development</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold">From $500</span>
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 fill-black" />
                      <span className="font-semibold">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-8 py-16 px-4 opacity-40">
          <span className="font-bold text-xl">KES • USD • Crypto</span>
          <span className="font-bold text-xl">⊗ M-Pesa Integration</span>
          <span className="font-bold text-xl">▲ Escrow System</span>
          <span className="font-serif text-2xl italic">Verified KYC</span>
          <span className="font-bold text-xl">◆ Milestone Based</span>
        </div>

        <section className="py-20 lg:py-28">
          <div className="mb-16">
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-4">Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl">Everything you need for secure, high-quality development projects with complete peace of mind.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all group cursor-pointer animate-slide-in-left">
              <div className="w-12 h-12 bg-[#1f7a5a]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#1f7a5a]/30 transition-colors">
                <Shield className="w-6 h-6 text-[#1f7a5a]" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Escrow Protection</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Your 43% deposit is held securely until milestones are delivered and approved.</p>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all group cursor-pointer animate-slide-in-left delay-100">
              <div className="w-12 h-12 bg-[#1f7a5a]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#1f7a5a]/30 transition-colors">
                <Check className="w-6 h-6 text-[#1f7a5a]" />
              </div>
              <h3 className="font-semibold text-lg mb-3">110% Refund Guarantee</h3>
              <p className="text-gray-600 text-sm leading-relaxed">If we fail to deliver, you receive 110% of your payment back—no questions asked.</p>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all group cursor-pointer animate-slide-in-left delay-200">
              <div className="w-12 h-12 bg-[#1f7a5a]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#1f7a5a]/30 transition-colors">
                <Users className="w-6 h-6 text-[#1f7a5a]" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Verified Developers</h3>
              <p className="text-gray-600 text-sm leading-relaxed">All developers are KYC-verified, skill-tested, and background-checked.</p>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all group cursor-pointer animate-slide-in-right delay-100">
              <div className="w-12 h-12 bg-[#1f7a5a]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#1f7a5a]/30 transition-colors">
                <TrendingUp className="w-6 h-6 text-[#1f7a5a]" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Milestone Tracking</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Monitor progress with milestone-based delivery and approval workflows.</p>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all group cursor-pointer animate-slide-in-right delay-200">
              <div className="w-12 h-12 bg-[#1f7a5a]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#1f7a5a]/30 transition-colors">
                <MessageSquare className="w-6 h-6 text-[#1f7a5a]" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Direct Communication</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Built-in messaging and collaboration tools for seamless project management.</p>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-lg hover:shadow-xl hover:bg-white/80 transition-all group cursor-pointer animate-slide-in-right delay-300">
              <div className="w-12 h-12 bg-[#1f7a5a]/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#1f7a5a]/30 transition-colors">
                <Zap className="w-6 h-6 text-[#1f7a5a]" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Fast Onboarding</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Start your project within 24 hours of connecting with a commissioner.</p>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6">How It Works</h2>
              <p className="text-lg text-gray-600 mb-8">Four simple steps to secure, quality development projects.</p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1f7a5a] text-white flex items-center justify-center flex-shrink-0 font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Find a Commissioner</h3>
                    <p className="text-gray-600">Browse verified sales partners and connect with the right fit for your project.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1f7a5a] text-white flex items-center justify-center flex-shrink-0 font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Pay 43% Deposit</h3>
                    <p className="text-gray-600">Secure your project with payment via card, M-Pesa, or cryptocurrency.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1f7a5a] text-white flex items-center justify-center flex-shrink-0 font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
                    <p className="text-gray-600">Approve milestones as they're delivered and monitor project status.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1f7a5a] text-white flex items-center justify-center flex-shrink-0 font-bold">4</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Final Payment</h3>
                    <p className="text-gray-600">Pay the remaining 57% upon project completion and launch.</p>
                  </div>
                </div>
              </div>

              <Link href="/jobs" className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-black hover:gap-3 transition-all">
                Get Started Today <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative h-96 lg:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1f7a5a]/10 to-[#14b8a6]/5 rounded-3xl animate-float"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Rocket className="w-12 h-12 text-[#1f7a5a]" />
                  </div>
                  <p className="text-gray-600 font-medium">Secure Platform</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-3xl p-12 md:p-16 lg:p-20 text-white">
            <div className="max-w-3xl">
              <h2 className="font-serif text-5xl md:text-6xl font-bold mb-6">Trusted by Growing Businesses</h2>
              <p className="text-lg text-gray-300 mb-12">Join hundreds of clients using our platform to build secure, high-quality software projects across Kenya and East Africa.</p>

              <div className="grid sm:grid-cols-2 gap-8 mb-12">
                <div>
                  <div className="text-4xl font-bold mb-2">$500K+</div>
                  <p className="text-gray-400">In project value delivered</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">200+</div>
                  <p className="text-gray-400">Verified developers</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">98%</div>
                  <p className="text-gray-400">Client satisfaction rate</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">24h</div>
                  <p className="text-gray-400">Average project start time</p>
                </div>
              </div>

              <Link href="/signup" className="bg-[#1f7a5a] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#176549] transition-colors inline-flex items-center gap-2">
                Start Your Project <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28">
          <div className="mb-16">
            <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-4">Development Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl">We offer comprehensive development services across all major technologies and platforms.</p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              'Web Development',
              'Mobile Apps (iOS/Android)',
              'Custom CRM Systems',
              'School Management Portals',
              'Payment Integration',
              'Admin Dashboards',
              'E-commerce Platforms',
              'UI/UX Design',
              'DevOps & Cloud Setup',
              'API Development',
              'Database Architecture',
              'QA & Testing'
            ].map((service, index) => (
              <div
                key={service}
                className={`bg-white rounded-3xl p-6 border border-gray-200 hover:shadow-2xl hover:border-[#1f7a5a] transition-all duration-300 ${index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'
                  } delay-${Math.min(index * 100, 400)}`}
              >
                <h4 className="font-semibold text-gray-900">{service}</h4>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 lg:py-28 border-t border-gray-200">
          <div className="max-w-3xl">
            <h2 className="font-serif text-5xl md:text-6xl font-bold mb-12">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <details className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#1f7a5a] transition-colors cursor-pointer group">
                <summary className="flex items-center justify-between font-semibold text-lg">
                  How does the escrow system work?
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-gray-600 mt-4">When you pay the 43% deposit, it's held in a secure escrow account. Funds are only released to developers as you approve each milestone, ensuring you always have control over payments.</p>
              </details>

              <details className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#1f7a5a] transition-colors cursor-pointer group">
                <summary className="flex items-center justify-between font-semibold text-lg">
                  What if I'm not satisfied with the work?
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-gray-600 mt-4">We offer a 110% refund guarantee. If we fail to deliver quality work that meets your requirements, you'll receive 110% of all payments made—no questions asked.</p>
              </details>

              <details className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#1f7a5a] transition-colors cursor-pointer group">
                <summary className="flex items-center justify-between font-semibold text-lg">
                  How are developers verified?
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-gray-600 mt-4">All developers undergo KYC verification, skill assessments, portfolio review, and background checks. We only accept the top 10% of applicants to ensure quality.</p>
              </details>

              <details className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#1f7a5a] transition-colors cursor-pointer group">
                <summary className="flex items-center justify-between font-semibold text-lg">
                  What payment methods do you accept?
                  <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="text-gray-600 mt-4">We accept credit/debit cards, M-Pesa, bank transfers, and cryptocurrency payments. All payments are processed securely through our escrow system.</p>
              </details>
            </div>
          </div>
        </section>

        <section className="py-20 lg:py-28 bg-gradient-to-br from-[#dcdcdc] to-[#f0f0f0] rounded-3xl px-8 md:px-16 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Ready to Build Your Project?</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">Connect with verified commissioners and start your secure development project today with escrow protection.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/jobs" className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors">
              Browse Open Jobs
            </Link>
            <Link href="/join" className="border border-black px-8 py-4 rounded-full font-semibold hover:bg-black hover:text-white transition-colors">
              Become a Commissioner
            </Link>
          </div>
          <p className="text-sm text-gray-600 mt-6">No upfront fees. 110% refund guarantee. Start in 24 hours.</p>
        </section>

        <footer className="border-t border-gray-200 py-12 mt-16">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 font-semibold mb-6">
                <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white font-black text-xl rotate-3">
                  K
                </div>
                <span className="text-xl font-black tracking-tighter">CREATIVE<span className="text-gray-400">.KE</span></span>
              </div>
              <p className="text-sm text-gray-600">Secure development projects with escrow protection across Kenya and East Africa.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/how-it-works" className="hover:text-black">How It Works</Link></li>
                <li><Link href="/jobs" className="hover:text-black">Open Jobs</Link></li>
                <li><Link href="/signup" className="hover:text-black">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Professionals</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/join" className="hover:text-black">Become a Commissioner</Link></li>
                <li><Link href="/login" className="hover:text-black">Developer Portal</Link></li>
                <li><Link href="/dashboard" className="hover:text-black">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-black">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-black">Terms of Service</Link></li>
                <li><Link href="/refunds" className="hover:text-black">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} CREATIVE.KE | Built for the East African Digital Economy.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
