"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { SITE } from "@/lib/site";

/**
 * Route-level error boundary.
 *
 * It shows a human message and a retry — never a stack trace, never an error
 * code from a provider, never anything that tells an attacker what broke. The
 * detail goes to the server log; the visitor gets a way forward.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Digest only — the message may contain internal detail.
    console.error("[app] route error", error.digest ?? "");
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-vx-bg px-6">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl border border-amber-500/30 bg-vx-bg3 text-amber-400">
          <AlertTriangle size={28} aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-vx-ink">
            Something went wrong
          </h1>
          <p className="mt-1 text-lg text-vx-silver">Algo salió mal</p>
          <p className="mt-4 text-sm text-vx-muted">
            We hit an unexpected error. Nothing you submitted has been lost. Try
            again, or contact us and we will sort it out.
          </p>
          <p className="mt-2 text-sm text-vx-silver-dim">
            Tuvimos un error inesperado. Nada de lo que enviaste se ha perdido.
            Inténtalo de nuevo o contáctanos.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-gradient-to-r from-vx-blue to-vx-cyan px-6 py-3 text-sm font-semibold text-vx-bg transition-opacity hover:opacity-90"
          >
            <RefreshCw size={16} aria-hidden />
            Try again · Reintentar
          </button>
          {/*
            A raw anchor, deliberately. This boundary catches router/render
            failures — a next/link soft navigation could re-enter the very code
            that just crashed. A full page load is the reliable escape hatch.
          */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="inline-flex min-h-[48px] items-center rounded-xl border border-[rgba(14,165,233,0.25)] px-5 py-3 text-sm font-medium text-vx-silver transition-colors hover:border-vx-blue hover:text-vx-blue"
          >
            Home · Inicio
          </a>
        </div>

        <p className="text-xs text-vx-silver-dim">
          {SITE.email} · {SITE.phone}
        </p>
      </div>
    </main>
  );
}
