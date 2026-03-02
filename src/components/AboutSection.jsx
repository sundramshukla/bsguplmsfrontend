function AboutSection() {
  return (
    <section id="about" className="bg-slate-50 py-16 md:py-24">
      <div className="container flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
        {/* Image */}
        <div className="w-full lg:w-1/2">
          <div className="relative">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUAdiqE9kEOG5wKufWfByFBkfZdf3xgOP-HV9l8fLFbodzvl70uhx2YHH31BkipD8nPpcJhzRpgoqpr42CrChzCM4_GcYeLjn9_Fltru-lkS14csGLpHXm8u2K-0KeFt12eg78NpIr_Ctshyb45z4vodWlhb6Yxut_s4DwUhkze1Z4rRVeAmM7ppcHCa9mYAfO76zYNeXGG4sAs62yLmFTYa8kJUIN2iWFirc2rzX8hL84TLc7o6mkYTuzr7AACJcEjAaomeXi4gG5"
              alt="Team working together"
              className="h-[360px] w-full rounded-2xl object-cover shadow-xl md:h-[420px]"
            />
            <div className="absolute -bottom-6 right-6 hidden rounded-2xl bg-[#7c3aed] px-7 py-6 text-white shadow-xl sm:block">
              <p className="text-4xl font-extrabold leading-none">10+</p>
              <p className="mt-1 text-sm opacity-90">Years of Excellence</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full lg:w-1/2">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#7c3aed]">
            Who We Are
          </p>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight mb-5">
            Empowering Learners <br />
            Across the Globe
          </h2>
          <p className="text-slate-600 leading-relaxed mb-7">
            Our mission is to provide world-class education that is accessible
            to everyone, everywhere. We believe that learning is a lifelong
            journey and our platform is built to support you every step of the
            way.
          </p>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-[2px] text-[#7c3aed]">
                check
              </span>
              <span className="text-slate-800 font-medium">
                Industry-standard curriculum updated quarterly
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-[2px] text-[#7c3aed]">
                check
              </span>
              <span className="text-slate-800 font-medium">
                Direct mentorship from top 1% industry experts
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-[2px] text-[#7c3aed]">
                check
              </span>
              <span className="text-slate-800 font-medium">
                Flexible learning schedules for working professionals
              </span>
            </li>
          </ul>

          <button
            type="button"
            className="rounded-lg bg-[#7c3aed] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6b21e3] transition-colors"
          >
            Read Our Story
          </button>
        </div>
      </div>
    </section>
  )
}

export default AboutSection

