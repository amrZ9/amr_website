import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { profile } from "@/data/profile";
import { formatPostDate, getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: `Blog | ${profile.fullName}`,
  description:
    "Opinions, growth strategy notes, and founder lessons from Amr Ahmed A.Aziz — on building products, marketing, and shipping ideas.",
  openGraph: {
    title: `Blog | ${profile.fullName}`,
    description:
      "Opinions, growth strategy notes, and founder lessons from Amr Ahmed A.Aziz.",
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <Header />
      <main className="blog-main">
        <div className="wrap">
          <section className="blog-hero">
            <span className="blog-eyebrow">/ Journal · Opinions · Growth</span>
            <h1>Blog.</h1>
            <p className="blog-hero-lead">
              Unfiltered notes on growth strategy, founder lessons, and building
              products people actually use.
            </p>
          </section>

          {posts.length === 0 ? (
            <div className="blog-empty">
              No posts published yet. Check back soon.
            </div>
          ) : (
            <section className="blog-list" aria-label="Blog posts">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="blog-card"
                >
                  <div className="blog-card-meta">
                    <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                    <span>{post.readingTime}</span>
                  </div>

                  <div className="blog-card-body">
                    <h2 className="blog-card-title">{post.title}</h2>
                    {post.description && (
                      <p className="blog-card-desc">{post.description}</p>
                    )}
                    {post.tags.length > 0 && (
                      <div className="blog-tags">
                        {post.tags.map((tag) => (
                          <span key={tag} className="blog-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="blog-card-arrow" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                </Link>
              ))}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
