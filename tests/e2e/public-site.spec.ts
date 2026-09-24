import { test, expect } from "@playwright/test";

/**
 * Public site end-to-end.
 *
 * These run against a REAL Next.js server, so they exercise the actual
 * middleware, Server Components, and route handlers. They deliberately need no
 * live Square / Supabase / Resend credentials — every assertion is about public
 * behaviour, redirects, accessibility, and the ABSENCE of confidential data.
 */

test.describe("homepage", () => {
  test("loads with exactly one H1 and the correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/VYNTEX/);
    // A single H1 per page is both an SEO and an accessibility requirement.
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("has a skip-to-content link as the first focusable element", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveAttribute("href", "#main-content");
  });

  test("contains the concise public navigation and key homepage sections", async ({ page }) => {
    await page.goto("/");
    for (const id of ["home", "services", "industries"]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    for (const label of ["Services", "Industries", "Partners", "About Us", "Contact"]) {
      await expect(page.getByRole("link", { name: label, exact: true }).first()).toBeVisible();
    }
  });

  test("clicking About Us opens the About page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "About Us", exact: true }).first().click();
    await expect(page).toHaveURL(/\/about$/);
  });

  test("the language toggle switches the whole page to Spanish and persists", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Español|Cambiar a Español/i }).first().click();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");

    // Persisted across a reload — the choice is not lost on navigation.
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("contains NO wholesale pricing anywhere in the delivered HTML or JS", async ({
    page,
  }) => {
    // The load-bearing assertion. If this ever fails, the entire partner margin
    // table is public.
    const bodies: string[] = [];
    page.on("response", async (res) => {
      const type = res.headers()["content-type"] ?? "";
      if (type.includes("javascript") || type.includes("html")) {
        try {
          bodies.push(await res.text());
        } catch {
          /* opaque response */
        }
      }
    });

    await page.goto("/", { waitUntil: "networkidle" });

    const wholesaleOnly = ["$660", "$720", "$650", "$210", "$360", "$440", "$480"];
    const all = bodies.join("\n");
    for (const figure of wholesaleOnly) {
      expect(all, `wholesale figure ${figure} leaked to the public`).not.toContain(figure);
    }
    // Service prices are no longer published. Services sync from Stripe and
    // are quoted after a consultation, so retail figures must be absent too.
    const retailFigures = ["$1,100", "$1,500", "$2,000+", "$4,000+", "$149/mo", "$95"];
    for (const figure of retailFigures) {
      expect(all, `retail price ${figure} is still published`).not.toContain(figure);
    }
  });

  test("services page shows no prices and books consultations", async ({ page }) => {
    await page.goto("/services");
    await expect(page.locator("h1")).toHaveCount(1);
    const text = await page.locator("main").innerText();
    expect(text).not.toMatch(/\$\s?\d/);
    expect(text).toMatch(/Free 30-minute consultation/i);
    expect(text).not.toMatch(/service fee/i);
    // Either Stripe-synced cards or the honest fallback — both lead to booking.
    await expect(page.getByRole("button", { name: /Book a Free Consultation/i }).first()).toBeVisible();
  });
});

test.describe("legal pages", () => {
  for (const path of ["/privacy", "/terms", "/cookies", "/accessibility"]) {
    test(`${path} loads with real content and one H1`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      // Not a stub.
      const text = await page.locator("main").innerText();
      expect(text.length).toBeGreaterThan(800);
      expect(text.toLowerCase()).not.toContain("coming soon");
      expect(text.toLowerCase()).not.toContain("lorem ipsum");
    });
  }
});

test.describe("reseller application", () => {
  test("the public page loads and shows NO wholesale pricing", async ({ page }) => {
    await page.goto("/partners/apply");
    await expect(page.locator("h1")).toHaveCount(1);

    const text = await page.locator("main").innerText();
    // Public program terms ARE allowed.
    expect(text).toContain("$199");
    // Confidential figures are NOT.
    for (const figure of ["$660", "$720", "$440"]) {
      expect(text).not.toContain(figure);
    }
  });

  test("rejects an empty submission with accessible errors", async ({ page }) => {
    await page.goto("/partners/apply");
    await page.getByRole("button", { name: /Submit application/i }).click();
    // Client-side validation fires; nothing is submitted.
    await expect(page.locator("[aria-invalid='true']").first()).toBeVisible();
  });
});

test.describe("checkout", () => {
  test("public checkout is retired and redirects to services", async ({ page }) => {
    await page.goto("/checkout?service=web-standard");
    await expect(page).toHaveURL(/\/services$/);
  });

  test("the API refuses public direct orders", async ({ request }) => {
    const res = await request.post("/api/checkout/create", {
      data: { orderType: "direct", serviceKey: "web-standard" },
    });
    // 410 when reached; 400/503 if validation or payment config short-circuits first.
    expect([400, 410, 503]).toContain(res.status());
  });
});

test.describe("protected routes", () => {
  for (const path of [
    "/portal",
    "/portal/partner",
    "/portal/partner/agreement",
    "/portal/admin",
    "/portal/orders",
    "/portal/files",
  ]) {
    test(`${path} redirects an unauthenticated visitor to login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe("infrastructure routes", () => {
  test("/robots.txt disallows the portal and API", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Disallow: /portal/");
    expect(body).toContain("Disallow: /api/");
  });

  test("/sitemap.xml lists public pages and NOT the portal", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("/partners/apply");
    expect(body).not.toContain("/portal");
  });

  test("/api/health reports configuration WITHOUT leaking any secret", async ({
    request,
  }) => {
    const res = await request.get("/api/health");
    const body = await res.text();
    // It reports whether things are configured, never what they are configured with.
    expect(body).toContain("checks");
    expect(body).not.toMatch(/sq0(atp|idp)-/); // a Square token prefix
    expect(body).not.toMatch(/re_[A-Za-z0-9]{20,}/); // a Resend key
    expect(body).not.toMatch(/eyJ[A-Za-z0-9_-]{20,}/); // a Supabase JWT
  });

  test("the cron endpoints reject an unauthenticated request", async ({ request }) => {
    for (const path of [
      "/api/cron/expire-partners",
      "/api/cron/process-emails",
    ]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(401);
    }
  });

  test("the Square webhook rejects an unsigned request", async ({ request }) => {
    const res = await request.post("/api/square/webhook", {
      data: { type: "payment.updated", event_id: "forged" },
    });
    // No signature -> no trust. A forged webhook cannot activate a partner.
    expect(res.status()).toBe(401);
  });
});

test.describe("404", () => {
  test("shows a real page with working navigation, not a dead end", async ({ page }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("link", { name: /Home/i }).first()).toBeVisible();
  });
});
