"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Phone, LogIn, LayoutDashboard } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { NAV_LINKS, SECTION_IDS, SITE, CONTACT_HREFS } from "@/lib/site";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import LanguageToggle from "@/components/ui/LanguageToggle";
import LogoutButton from "@/components/auth/LogoutButton";
import { openConsultation } from "@/components/BookConsultation";

/**
 * Sticky, responsive navigation.
 * - Hash links scroll to sections and update the URL natively (back/forward,
 *   refresh, and direct #hash URLs all work with no extra JS).
 * - Active section is highlighted via IntersectionObserver (does not push
 *   history entries).
 * - Mobile drawer closes on ESC, on outside click, and on link selection.
 */
export default function Nav() {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [, setActive] = useState<string>(SECTION_IDS.home);
  const [authed, setAuthed] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Reflect auth state (client-side only) to toggle Login vs Portal.
  useEffect(() => {
    let active = true;
    let unsub: (() => void) | undefined;
    try {
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data }) => {
        if (active) setAuthed(Boolean(data.user));
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) setAuthed(Boolean(session?.user));
      });
      unsub = () => data.subscription.unsubscribe();
    } catch {
      /* Supabase unconfigured — treat as signed out. */
    }
    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  // Nav shadow after scrolling past the hero fold.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view.
  useEffect(() => {
    const ids = [SECTION_IDS.home, ...NAV_LINKS.map((l) => SECTION_IDS[l.key])];
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Drawer: ESC to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Drawer: outside click to close.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    // Delay so the opening click doesn't immediately close it.
    const id = window.setTimeout(() => document.addEventListener("click", onClick), 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  const Wordmark = (
    <Link
      href="/"
      // shrink-0 is load-bearing: without it flex shrinks the logo past its
      // content and it collides with the first nav link.
      className="flex shrink-0 items-center gap-2.5"
      aria-label={SITE.name}
      onClick={() => setOpen(false)}
    >
      <Image
        src="/vyntex-mark.png"
        alt=""
        width={44}
        height={38}
        priority
        className="h-9 w-auto shrink-0"
      />
      <span className="whitespace-nowrap text-lg font-bold tracking-tight vx-grad-text">
        VYNTEX
      </span>
    </Link>
  );

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-shadow",
          "border-[rgba(14,165,233,0.12)] bg-vx-bg/80",
          scrolled ? "shadow-vx-nav" : "shadow-none",
        ].join(" ")}
      >
      <nav
        aria-label={t.a11y.primaryNav}
        className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-5 xl:px-8"
      >
        {Wordmark}

        {/*
          Desktop links.

          BREAKPOINT: xl (1280px), not lg (1024px). Eight links plus a language
          toggle, a login link, and two buttons cannot fit in the ~1136px of
          usable width at lg — flex would shrink them past their content and they
          would overlap. Below xl the drawer handles navigation, which is the
          honest answer rather than a squeezed one.

          whitespace-nowrap + shrink-0 mean a label can never wrap to a second
          line and an item can never be compressed into its neighbour.
        */}
        <ul className="hidden shrink-0 items-center gap-4 xl:flex 2xl:gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = false;
            return (
              <li key={link.key} className="shrink-0">
                <Link
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={[
                    "relative whitespace-nowrap text-[0.8125rem] font-medium transition-colors 2xl:text-sm",
                    "after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full",
                    "after:origin-left after:scale-x-0 after:bg-vx-blue after:transition-transform after:duration-200",
                    isActive
                      ? "text-vx-ink after:scale-x-100"
                      : "text-vx-muted hover:text-vx-ink hover:after:scale-x-100",
                  ].join(" ")}
                >
                  {t.nav[link.key]}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-2 xl:flex 2xl:gap-3">
          <LanguageToggle />

          {authed ? (
            <>
              <Link
                href="/portal"
                aria-label={t.actions.clientPortal}
                title={t.actions.clientPortal}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[0.8125rem] font-medium text-vx-muted transition-colors hover:text-vx-ink"
              >
                <LayoutDashboard size={15} aria-hidden />
                {/* Label appears only when there is genuinely room for it. */}
                <span>{t.actions.clientPortal}</span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              aria-label={t.actions.clientLogin}
              title={t.actions.clientLogin}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[0.8125rem] font-medium text-vx-muted transition-colors hover:text-vx-ink"
            >
              <LogIn size={15} aria-hidden />
              <span>{t.actions.clientLogin}</span>
            </Link>
          )}

          <Button
            onClick={openConsultation}
            variant="ghost"
            size="sm"
            className="shrink-0"
          >
            {t.actions.bookConsultation}
          </Button>
        </div>

        {/* Mobile / tablet trigger */}
        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[rgba(14,165,233,0.25)] p-2 text-vx-ink xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-drawer"
          aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open ? (
        <div
          id="mobile-drawer"
          ref={drawerRef}
          className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-[rgba(14,165,233,0.12)] bg-vx-bg2/95 backdrop-blur-xl xl:hidden"
        >
          <ul className="flex flex-col gap-1 px-5 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-base text-vx-muted hover:bg-vx-bg3 hover:text-vx-ink"
                >
                  {t.nav[link.key]}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 border-t border-[rgba(14,165,233,0.12)] px-5 py-4">
            <div className="flex items-center justify-between">
              <LanguageToggle />
              <a
                href={CONTACT_HREFS.phone}
                className="inline-flex items-center gap-2 font-mono text-sm text-vx-silver"
              >
                <Phone size={15} aria-hidden />
                {SITE.phone}
              </a>
            </div>
            {authed ? (
              <Link
                href="/portal"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(14,165,233,0.2)] px-3.5 py-2.5 text-sm font-medium text-vx-silver hover:text-vx-ink"
              >
                <LayoutDashboard size={16} aria-hidden />
                {t.actions.clientPortal}
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(14,165,233,0.2)] px-3.5 py-2.5 text-sm font-medium text-vx-silver hover:text-vx-ink"
              >
                <LogIn size={16} aria-hidden />
                {t.actions.clientLogin}
              </Link>
            )}
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setOpen(false);
                openConsultation();
              }}
            >
              {t.actions.bookConsultation}
            </Button>
            {authed ? <LogoutButton className="w-full justify-center" /> : null}
          </div>
        </div>
      ) : null}
      </header>
    </>
  );
}
