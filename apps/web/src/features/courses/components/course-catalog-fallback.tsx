export function CourseCatalogFallback() {
  return (
    <section className="class-section" id="classes" aria-busy="true">
      <div className="section-heading">
        <div>
          <div className="section-kicker">FIND YOUR NEXT THING</div>
          <h2>요즘 이런 걸 배워요<span>.</span></h2>
          <p>강의 목록을 불러오는 중이에요.</p>
        </div>
      </div>
      <div className="course-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="course-card" key={index}>
            <div className="course-skeleton-image" />
            <div className="course-skeleton-line" />
            <div className="course-skeleton-line course-skeleton-line--short" />
          </div>
        ))}
      </div>
      <span className="sr-only" role="status">강의를 불러오는 중입니다.</span>
    </section>
  );
}
