import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fetchLandingPage } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: { tenant: string; slug: string };
}): Promise<Metadata> {
  const lp = await fetchLandingPage(params.tenant, params.slug);
  return { title: lp ? `${lp.title} — ${lp.store}` : "Página — Motora" };
}

export default async function LandingPage({
  params,
}: {
  params: { tenant: string; slug: string };
}) {
  const lp = await fetchLandingPage(params.tenant, params.slug);
  if (!lp) notFound();
  const { headline, subheadline, ctaText, ctaUrl } = lp.content;

  return (
    <main className="min-h-screen flex flex-col">
      <header className="flex items-center gap-3 px-6 py-4">
        <Link href={`/loja/${params.tenant}`} className="flex items-center gap-2 font-bold text-[15px] tracking-tight">
          <span className="w-[26px] h-[26px] rounded-lg grid place-items-center bg-brand text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" /><path d="M5 13h14v4H5z" /></svg>
          </span>
          {lp.store}
        </Link>
        <div className="ml-auto"><ThemeToggle /></div>
      </header>

      <section className="flex-1 grid place-items-center px-6 py-16">
        <div className="max-w-[680px] text-center">
          <span className="inline-block text-[11px] font-semibold tracking-[0.08em] uppercase text-brand bg-brand-tint rounded-full px-3 py-1 mb-5">
            Oferta {lp.store}
          </span>
          <h1 className="text-[40px] md:text-[52px] font-semibold tracking-tight leading-[1.05]">{headline}</h1>
          {subheadline && <p className="text-muted text-[17px] mt-5 max-w-[52ch] mx-auto">{subheadline}</p>}
          <div className="mt-9 flex items-center justify-center gap-3 flex-wrap">
            <a href={ctaUrl || "#"} className="rounded-[12px] bg-brand hover:bg-brand-strong text-white px-7 py-3.5 text-[15px] font-medium transition-colors">
              {ctaText || "Tenho interesse"}
            </a>
            <Link href={`/loja/${params.tenant}`} className="rounded-[12px] border border-border px-6 py-3.5 text-[15px] font-medium hover:bg-surface-2 transition-colors">
              Ver estoque
            </Link>
          </div>
        </div>
      </section>

      <footer className="text-center text-[12px] text-faint py-6">
        Powered by <span className="font-semibold">Motora</span>
      </footer>
    </main>
  );
}
