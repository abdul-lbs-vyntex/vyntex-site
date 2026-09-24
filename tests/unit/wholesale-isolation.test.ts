import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * THE MOST IMPORTANT TEST IN THIS REPOSITORY.
 *
 * Confidential wholesale pricing must never be reachable from a Client
 * Component, because anything a Client Component imports is compiled into a
 * public JavaScript chunk that anyone can download with curl.
 *
 * This is enforced at build time by `import "server-only"` in
 * lib/pricing-reseller.ts. These tests assert that the enforcement is actually
 * in place and that nobody has quietly removed it or routed around it.
 *
 * A regression here is not a style issue. It is the entire wholesale price book
 * leaking to the public internet.
 */

const ROOT = resolve(__dirname, "../..");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const sourceFiles = walk(join(ROOT, "app"))
  .concat(walk(join(ROOT, "components")))
  .concat(walk(join(ROOT, "lib")))
  .concat(walk(join(ROOT, "context")));

function isClientComponent(content: string): boolean {
  return /^\s*["']use client["']/m.test(content);
}

/** Removes block and line comments so a substring check tests CODE, not prose. */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("wholesale pricing isolation", () => {
  it("lib/pricing-reseller.ts is marked server-only", () => {
    const src = readFileSync(join(ROOT, "lib/pricing-reseller.ts"), "utf8");
    expect(src).toMatch(/import\s+["']server-only["']/);
  });

  it("RESELLER_PRICING lives ONLY in the server-only module", () => {
    const offenders = sourceFiles.filter((file) => {
      // Normalize Windows backslashes so this check works on every OS.
      if (file.replace(/\\/g, "/").endsWith("lib/pricing-reseller.ts")) return false;
      const src = readFileSync(file, "utf8");
      // Declaration, not a reference in a comment or an import.
      return /export\s+const\s+RESELLER_PRICING/.test(src);
    });
    expect(offenders).toEqual([]);
  });

  it("NO client component imports the wholesale price book", () => {
    const offenders = sourceFiles.filter((file) => {
      const src = readFileSync(file, "utf8");
      if (!isClientComponent(src)) return false;
      // A type-only import is erased at compile time and is harmless.
      const runtimeImport =
        /import\s+(?!type\s)[^;]*from\s+["']@\/lib\/pricing-reseller["']/.test(src);
      return runtimeImport;
    });
    expect(offenders).toEqual([]);
  });

  it("public pricing module contains NO wholesale figures", () => {
    const src = readFileSync(join(ROOT, "lib/pricing.ts"), "utf8");
    // Partner costs that must never appear in a module the browser receives.
    const wholesaleOnly = ["$660", "$720", "$650", "$210", "$360", "$440", "$480"];
    for (const figure of wholesaleOnly) {
      expect(src, `lib/pricing.ts must not contain ${figure}`).not.toContain(figure);
    }
  });

  it("the chatbot cannot reach wholesale pricing", () => {
    // The chatbot answers pricing questions out loud. If it could see the
    // wholesale book, a single topic click would publish the whole margin table.
    // Comments are stripped first: the file DISCUSSES the constraint, and a
    // naive substring match would fire on the explanation of the rule.
    const src = stripComments(readFileSync(join(ROOT, "components/Chatbot.tsx"), "utf8"));
    expect(src).not.toContain("pricing-reseller");
    expect(src).not.toContain("RESELLER_PRICING");
  });
});

describe("secret isolation", () => {
  const serverOnlyModules = [
    "lib/square.ts",
    "lib/supabase/admin.ts",
    "lib/reseller.ts",
    "lib/orders.ts",
    "lib/agreements.ts",
    "lib/admin.ts",
    "lib/files.ts",
    "lib/cron.ts",
    "lib/email/outbox.ts",
  ];

  it("every module that touches a secret is marked server-only", () => {
    for (const mod of serverOnlyModules) {
      const src = readFileSync(join(ROOT, mod), "utf8");
      expect(src, `${mod} must import "server-only"`).toMatch(
        /import\s+["']server-only["']/,
      );
    }
  });

  it("no secret is exposed via a NEXT_PUBLIC_ variable", () => {
    const secrets = [
      "SQUARE_ACCESS_TOKEN",
      "SQUARE_WEBHOOK_SIGNATURE_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "RESEND_API_KEY",
      "UPSTASH_REDIS_REST_TOKEN",
      "CRON_SECRET",
      "IP_HASH_SALT",
    ];
    for (const file of sourceFiles) {
      const src = readFileSync(file, "utf8");
      for (const secret of secrets) {
        expect(src, `${file} must not read NEXT_PUBLIC_${secret}`).not.toContain(
          `NEXT_PUBLIC_${secret}`,
        );
      }
    }
  });

  it("no client component reads a server secret from process.env", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles) {
      const src = readFileSync(file, "utf8");
      if (!isClientComponent(src)) continue;
      // In a client bundle only NEXT_PUBLIC_* is even substituted; anything else
      // would be a mistake, and a dangerous-looking one.
      const envReads = src.match(/process\.env\.([A-Z0-9_]+)/g) ?? [];
      for (const read of envReads) {
        if (!read.includes("NEXT_PUBLIC_") && !read.includes("NODE_ENV")) {
          offenders.push(`${file}: ${read}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
