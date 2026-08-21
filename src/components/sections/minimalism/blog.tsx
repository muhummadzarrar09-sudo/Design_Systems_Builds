"use client";

export function MinimalismBlog() {
  const posts = [
    { title: "The Edge of Enough", tag: "Philosophy", date: "Dec 12", readTime: "4 min" },
    { title: "Typography as Architecture", tag: "Design", date: "Nov 28", readTime: "6 min" },
    { title: "The Case for Constraints", tag: "Process", date: "Nov 15", readTime: "5 min" },
    { title: "Space is a Material", tag: "Theory", date: "Oct 30", readTime: "3 min" },
  ];

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto" style={{ backgroundColor: "var(--secondary)" }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-black tracking-tight mb-2">Latest Writings</h2>
        <p className="text-sm mb-12" style={{ color: "var(--muted-fg)" }}>Thoughts on design, clarity, and craft.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px" style={{ backgroundColor: "var(--border)" }}>
          {posts.map((post) => (
            <div key={post.title} className="p-8" style={{ backgroundColor: "var(--bg)" }}>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-fg)" }}>{post.tag}</span>
              <h3 className="text-xl font-bold mt-2 mb-3">{post.title}</h3>
              <span className="text-xs" style={{ color: "var(--muted-fg)" }}>{post.date} &middot; {post.readTime}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
