function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#f8f5ff] pt-8 pb-16 md:pb-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed]/5 rounded-full blur-3xl -mx-20 -my-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#7c3aed]/10 rounded-full blur-3xl -mx-20 -my-20"></div>
      
      <div className="container relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#7c3aed]">
            Success Stories
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
            What Our Officers Say
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Hear from the dedicated leaders who are guiding our youth and shaping the future through the BSGUP platform.
          </p>
          <div className="h-1 w-20 bg-[#7c3aed] mx-auto rounded-full mt-6" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Testimonial 1 */}
          <article className="bg-white p-8 rounded-2xl shadow-lg border border-[#7c3aed]/10 hover:shadow-xl transition-all duration-300 relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#7c3aed]/5 directly to-transparent rounded-tr-2xl"></div>
            <div className="flex gap-1 text-yellow-500 mb-6">
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
            </div>
            <p className="italic text-slate-700 mb-8 leading-relaxed relative z-10 h-32 overflow-hidden">
              &quot;The BSGUP training programs have completely transformed how we organize units. The structured curriculum provides clear paths for developing discipline and leadership in our scouts. It is an invaluable resource for any officer.&quot;
            </p>
            <div className="flex items-center gap-4 relative z-10 pt-4 border-t border-slate-100">
              <div className="w-14 h-14 bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                A
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">Amit Kumar</p>
                <p className="text-xs text-[#7c3aed] font-bold uppercase tracking-wider">
                  Scout Master @ District HQ
                </p>
              </div>
            </div>
          </article>

          {/* Testimonial 2 */}
          <article className="bg-[#7c3aed] p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform md:-translate-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mx-10 -my-10"></div>
            <div className="flex gap-1 text-yellow-300 mb-6">
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
            </div>
            <p className="italic text-white mb-8 leading-relaxed relative z-10 h-32 overflow-hidden">
              &quot;As a new officer, I found the resources provided by the online platform incredibly helpful. It breaks down complex administrative tasks, making it so much easier to run my guide unit efficiently and with great enthusiasm!&quot;
            </p>
            <div className="flex items-center gap-4 relative z-10 pt-4 border-t border-white/20">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#7c3aed] font-bold text-xl shadow-md">
                P
              </div>
              <div>
                <p className="font-bold text-white text-lg">Priya Sharma</p>
                <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">
                  Guide Captain
                </p>
              </div>
            </div>
          </article>

          {/* Testimonial 3 */}
          <article className="bg-white p-8 rounded-2xl shadow-lg border border-[#7c3aed]/10 hover:shadow-xl transition-all duration-300 relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#7c3aed]/5 directly to-transparent rounded-tr-2xl"></div>
            <div className="flex gap-1 text-yellow-500 mb-6">
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
              <span className="material-symbols-outlined text-xl">star</span>
            </div>
            <p className="italic text-slate-700 mb-8 leading-relaxed relative z-10 h-32 overflow-hidden">
              &quot;The advanced training modules perfectly filled the knowledge gaps for our senior officers. The collaborative features and practical guidance have elevated our community engagement and boosted our overall effectiveness.&quot;
            </p>
            <div className="flex items-center gap-4 relative z-10 pt-4 border-t border-slate-100">
              <div className="w-14 h-14 bg-gradient-to-r from-[#7c3aed] to-[#5b21b6] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                R
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">Rajesh Singh</p>
                <p className="text-xs text-[#7c3aed] font-bold uppercase tracking-wider">
                  District Commissioner
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default Testimonials

