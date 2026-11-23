import { ProductCard } from "@/components/launcher/product-card";
import { Wordmark } from "@/components/brand/wordmark";
import { products } from "@/lib/products";
import { getWorkspace } from "@/lib/workspace";
import { nameFromEmail } from "@/lib/labels";

export default async function Home() {
  const { identity } = await getWorkspace();
  return (
    <div className="flex min-h-full flex-col bg-surface-subtle">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Wordmark />
        <a href="/choose-clinic" className="focus-ring rounded-xs text-[13px] font-medium text-brand-text hover:underline">
          Switch clinic
        </a>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-12 sm:pt-12">
        <h1 className="text-2xl leading-tight font-semibold text-text-primary">Welcome, {nameFromEmail(identity.email).split(" ")[0]}</h1>
        <p className="mt-1.5 text-sm text-text-secondary">Open a product to start working.</p>
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </main>
      <footer className="px-5 py-5 text-xs text-text-tertiary sm:px-8">© {new Date().getFullYear()} Oryndoc</footer>
    </div>
  );
}
