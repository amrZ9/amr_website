import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { profile } from "@/data/profile";
import {
  formatPostDate,
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  markdownToHtml,
} from "@/lib/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://amrahmed.com";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: `Not Found | ${profile.fullName}` };
  }

  return {
    title: `${post.title} | ${profile.fullName}`,
    description: post.description,
    keywords: post.keywords.length > 0 ? post.keywords : post.tags,
    authors: [{ name: profile.fullName }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [profile.fullName],
      tags: post.tags,
      url: `${SITE_URL}/blog/${post.slug}`,
      ...(post.coverImage ? { images: [{ url: post.coverImage, alt: post.coverAlt || post.title }] } : {}),
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const htmlContent = markdownToHtml(post.content);
  const related = getRelatedPosts(post.slug, post.tags, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    keywords: post.keywords.join(", "),
    url: `${SITE_URL}/blog/${post.slug}`,
    author: {
      "@type": "Person",
      name: profile.fullName,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: profile.fullName,
    },
  };

  return (
    <>
      <Header />
      <main className="blog-main">
        <article className="blog-article-wrap">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          <Link href="/blog" className="blog-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>All articles</span>
          </Link>

          <header className="blog-article-header">
            <div className="blog-article-meta">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span>·</span>
              <span>{post.readingTime}</span>
              <span>·</span>
              <span>By {profile.fullName}</span>
            </div>

            <h1>{post.title}</h1>

            {post.description && (
              <p className="blog-article-lead">{post.description}</p>
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
          </header>

          {post.coverImage && (
            <figure className="blog-cover">
              <img src={post.coverImage} alt={post.coverAlt || post.title} />
            </figure>
          )}

          <div
            className="blog-prose"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          <aside className="blog-author-box">
            <div>
              <strong>{profile.fullName}</strong>
              <p>
                Growth &amp; Marketing Strategist · Founder. Sharing honest
                lessons on growth, product, and building from zero.
              </p>
            </div>
            <Link href="/#contact" className="text-link">
              <span>Get in touch</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </aside>

          {related.length > 0 && (
            <section className="blog-related" aria-label="More articles">
              <h2>More from the blog</h2>
              <div className="blog-related-grid">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="blog-related-card"
                  >
                    <span>
                      {formatPostDate(item.date)} · {item.readingTime}
                    </span>
                    <strong>{item.title}</strong>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
