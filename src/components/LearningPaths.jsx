function LearningPaths() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3">
            Explore Our Learning Paths
          </h2>
          <div className="h-1 w-20 bg-[#7c3aed] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {/* Beginner Card */}
          <article className="bg-white p-7 rounded-xl border border-[#eee] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center text-[#7c3aed] mb-5">
              <span className="material-symbols-outlined text-3xl">
                menu_book
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Beginner
            </h3>
            <p className="text-slate-600 leading-relaxed mb-5 text-sm">
              Start from scratch with fundamentals and build a solid foundation
              in your chosen field. No prior experience required.
            </p>
            <a
              href="#"
              className="text-[#7c3aed] font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              Explore Path{' '}
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </a>
          </article>

          {/* Intermediate Card */}
          <article className="bg-white p-7 rounded-xl border border-[#eee] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center text-[#7c3aed] mb-5">
              <span className="material-symbols-outlined text-3xl">
                rocket_launch
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Intermediate
            </h3>
            <p className="text-slate-600 leading-relaxed mb-5 text-sm">
              Bridge the gap to professional proficiency with practical projects
              and advanced workflows for career advancement.
            </p>
            <a
              href="#"
              className="text-[#7c3aed] font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              Explore Path{' '}
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </a>
          </article>

          {/* Advanced Card */}
          <article className="bg-white p-7 rounded-xl border border-[#eee] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center text-[#7c3aed] mb-5">
              <span className="material-symbols-outlined text-3xl">trophy</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              High Proficiency
            </h3>
            <p className="text-slate-600 leading-relaxed mb-5 text-sm">
              Master advanced techniques and leadership skills. Designed for
              senior roles and specialized expert positions.
            </p>
            <a
              href="#"
              className="text-[#7c3aed] font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              Explore Path{' '}
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </a>
          </article>
      </div>
      </div>
    </section>
  )
}

export default LearningPaths

