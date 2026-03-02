function Testimonials() {
  return (
    <section id="testimonials" className="bg-white py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3">
            What Our Students Say
          </h2>
          <p className="text-slate-600">
            Join the thousands of professionals who changed their lives
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
        {/* Testimonial 1 */}
        <article className="bg-white p-7 rounded-xl border border-[#eee] shadow-sm">
          <div className="flex gap-1 text-yellow-400 mb-5">
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
          </div>
          <p className="italic text-slate-600 mb-6 leading-relaxed text-sm">
            &quot;The curriculum is incredibly practical. I landed a senior
            developer role within 3 months of finishing the Advanced path. The
            community support is unmatched.&quot;
          </p>
          <div className="flex items-center gap-4">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPSFKWROoeo9hqORhhvNzz6eo7Nz1RDD_DB-BhFMMfRmHKzOsiYnCL0G3i7X2vn1z2TAIaYkBsOrXGMhnW7TLFK5Gvh2XtEOgyBKpRi3mz8Tv5rdsByXruuGDE9pw2yyFVXV73ovoyAt7safQdfsstgMQrKEye1gbsjJyf1roBSwYTWUsTNVn1EzVF7rb4Wi8VyE1s-10fxeRUEvQ7bBsX0jjev-WQNxpDpiuleemsUkbwuqdgMBRZLyk5V7I2TY9O1OYTIWTRpg7V"
              alt="Student profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-slate-900">Sarah Jenkins</p>
              <p className="text-xs text-[#7c3aed] font-semibold uppercase tracking-wider">
                Product Designer @ Meta
              </p>
            </div>
          </div>
        </article>

        {/* Testimonial 2 */}
        <article className="bg-white p-7 rounded-xl border border-[#eee] shadow-sm">
          <div className="flex gap-1 text-yellow-400 mb-5">
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
          </div>
          <p className="italic text-slate-600 mb-6 leading-relaxed text-sm">
            &quot;As a beginner, I was intimidated by coding. LMS Pro broke it
            down into digestible pieces. I&apos;m now building my own mobile
            apps!&quot;
          </p>
          <div className="flex items-center gap-4">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaROO-QGZFXGTDgbZlzEO3u_ITO004OXRe8DKKcJ52WssD8F6WHnkSww7TYUvi5VBY0-G8RRs1DcQzcqgZriKxUAzimBB36YWZMDVRoY9dHMmH75XiOyngHMOfeFo4OdDbTYk4Q7G7_agR4_IO2lRoTkm7duu0neZcOuLR5PGC651sWZJNQgWGstiaOJ30H9GqvYsUoTuJ5wFGCzFguypA9LvKg1-g31nKbA9eBTPACyWwmsR5QLIWfb5UyqlCYCUFltz3IKA-Uxuv"
              alt="Student profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-slate-900">Michael Chen</p>
              <p className="text-xs text-[#7c3aed] font-semibold uppercase tracking-wider">
                Mobile Dev @ StartUpX
              </p>
            </div>
          </div>
        </article>

        {/* Testimonial 3 */}
        <article className="bg-white p-7 rounded-xl border border-[#eee] shadow-sm">
          <div className="flex gap-1 text-yellow-400 mb-5">
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
          </div>
          <p className="italic text-slate-600 mb-6 leading-relaxed text-sm">
            &quot;The intermediate course perfectly filled my knowledge gaps.
            The mentor feedback on my final project was game-changing for my
            professional growth.&quot;
          </p>
          <div className="flex items-center gap-4">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdBUokPW3bVNAfxfJ4zJWalqaeog6Yhj2Fm7lXSeKsa8Q_DlocYnGahjgId-3VvPdyVUdzK_z9wlLfR_p4wkCObCmZ28JXQ7ikCZfhXCFHDoqZNMPFnzq9_0MZzGlyoXqc6pZS7sqWwuMPJMMlUo3FUELaWod0wa2d3vuo0nKclbjoXul27LESHTBUl6vQkQXzyJnw41K8tbV6DwmYCj-MNKoISfbJYPg_dwOm2YzgyI4V1ysgZ0bClIo2DkY52C_WuJLqHQMMGVvi"
            alt="Student profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-slate-900">Jessica Alva</p>
              <p className="text-xs text-[#7c3aed] font-semibold uppercase tracking-wider">
                Data Analyst @ Stripe
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

