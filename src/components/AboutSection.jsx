function AboutSection() {
  return (
    <section id="about" className="bg-slate-50 pt-8 pb-16 md:pb-24">
      <div className="container flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
        {/* Image */}
        <div className="w-full lg:w-1/2">
          <div className="relative">
            <iframe
              src="https://www.youtube.com/embed/tXdovpsdkYA?si=dgIQy7NzT8CsCAkp&enablejsapi=1&controls=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&showinfo=0&fs=1"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation allow-orientation-lock"
              className="h-[360px] w-full rounded-2xl object-cover shadow-xl md:h-[420px]"
            ></iframe>
            <div className="absolute -bottom-6 right-6 hidden rounded-2xl bg-[#7c3aed] px-7 py-6 text-white shadow-xl sm:block">
              <p className="text-4xl font-extrabold leading-none">75+</p>
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
            Empowering Young Leaders <br />
            Through Scouting & Guiding
          </h2>
          <div className="text-slate-600 leading-relaxed mb-7 space-y-4">
            <p>
              Our mission is to develop responsible, disciplined, and skilled young individuals through the principles of Scouting and Guiding. We believe that learning is not limited to classrooms; it happens through real-life experiences, teamwork, leadership, and service to society.
            </p>
            <p>
              Through the Scout Guide BSGUP platform, we aim to train students and volunteers with practical skills, character development, and leadership values so they can contribute positively to their communities and the nation.
            </p>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-[2px] text-[#7c3aed]">
                check
              </span>
              <span className="text-slate-800 font-medium">
                Structured Scout & Guide training programs based on BSG principles
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-[2px] text-[#7c3aed]">
                check
              </span>
              <span className="text-slate-800 font-medium">
                Leadership, discipline, and life-skill development activities
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-[2px] text-[#7c3aed]">
                check
              </span>
              <span className="text-slate-800 font-medium">
                Flexible learning through online guidance, resources, and mentorship
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

