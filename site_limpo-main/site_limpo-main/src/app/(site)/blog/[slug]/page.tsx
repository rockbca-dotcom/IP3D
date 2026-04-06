"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, useInView } from "framer-motion";
import {
  HiArrowLeft,
  HiOutlineCalendar,
  HiOutlineEye,
  HiOutlineTag,
  HiOutlineShare,
  HiArrowRight,
} from "react-icons/hi";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

interface BlogComment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  cover: string | null;
  published: boolean;
  publishedAt: string | null;
  views: number;
  categories: { category: BlogCategory }[];
  tags: { tag: BlogTag }[];
  comments: BlogComment[];
  createdAt: string;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  image: string | null;
  cover: string | null;
  categories: { category: BlogCategory }[];
  createdAt: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ name: "", email: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) {
        setPost(null);
        return;
      }
      const data = await res.json();
      setPost(data.post);
      setRelatedPosts(data.relatedPosts || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(commentForm),
      });
      if (res.ok) {
        setCommentSuccess(true);
        setCommentForm({ name: "", email: "", content: "" });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif font-semibold text-black mb-4">
          Post não encontrado
        </h1>
        <Link
          href="/blog"
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
        >
          <HiArrowLeft className="w-4 h-4" />
          Voltar para o blog
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative pt-40 pb-16 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Back Link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8"
            >
              <HiArrowLeft className="w-4 h-4" />
              Voltar para o blog
            </Link>

            {/* Categories */}
            <div className="flex items-center gap-2 mb-6">
              {post.categories.map((c) => (
                <span
                  key={c.category.id}
                  className="px-3 py-1 text-xs font-medium bg-black text-white"
                >
                  {c.category.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-black mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
              <span className="flex items-center gap-2">
                <HiOutlineCalendar className="w-4 h-4" />
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
                  "pt-BR",
                  { day: "numeric", month: "long", year: "numeric" }
                )}
              </span>
              <span className="flex items-center gap-2">
                <HiOutlineEye className="w-4 h-4" />
                {post.views} visualizações
              </span>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      {(post.cover || post.image) && (
        <section className="pb-12">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="relative aspect-[21/9] overflow-hidden bg-gray-100">
                <Image
                  src={post.cover || post.image || ""}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            {/* Article Content */}
            <article className="prose prose-lg prose-gray max-w-none">
              <div
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: post.content?.replace(/\n/g, "<br/>") || "" }}
              />
            </article>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-3 flex-wrap">
                  <HiOutlineTag className="w-5 h-5 text-gray-400" />
                  {post.tags.map((t) => (
                    <Link
                      key={t.tag.id}
                      href={`/blog?tag=${t.tag.slug}`}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm hover:bg-gray-200 transition-colors"
                    >
                      #{t.tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-gray-500">
                  <HiOutlineShare className="w-5 h-5" />
                  Compartilhar:
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <FaFacebookF className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                  >
                    <FaTwitter className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                  >
                    <FaLinkedinIn className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-serif font-semibold text-black mb-8">
              Comentários ({post.comments.length})
            </h2>

            {/* Existing Comments */}
            {post.comments.length > 0 && (
              <div className="space-y-6 mb-12">
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-black">{comment.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-gray-600">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Form */}
            <div className="bg-white p-8 border border-gray-200">
              <h3 className="text-xl font-serif font-semibold text-black mb-6">
                Deixe um comentário
              </h3>

              {commentSuccess ? (
                <div className="p-4 bg-green-50 text-green-700 text-center">
                  Comentário enviado! Aguardando aprovação.
                </div>
              ) : (
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={commentForm.name}
                        onChange={(e) =>
                          setCommentForm({ ...commentForm, name: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        required
                        value={commentForm.email}
                        onChange={(e) =>
                          setCommentForm({ ...commentForm, email: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentário *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={commentForm.content}
                      onChange={(e) =>
                        setCommentForm({ ...commentForm, content: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 outline-none focus:border-black transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Enviando..." : "Enviar Comentário"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-black mb-12 text-center">
              Posts Relacionados
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost, index) => (
                <motion.article
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 mb-5">
                      {(relatedPost.cover || relatedPost.image) && (
                        <Image
                          src={relatedPost.cover || relatedPost.image || ""}
                          alt={relatedPost.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {relatedPost.categories.slice(0, 1).map((c) => (
                        <span
                          key={c.category.id}
                          className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium bg-gray-100 text-gray-600"
                        >
                          {c.category.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-black mb-3 group-hover:text-gray-700 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <span className="flex items-center gap-1 text-sm text-black font-medium group-hover:gap-2 transition-all">
                      Ler mais
                      <HiArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
