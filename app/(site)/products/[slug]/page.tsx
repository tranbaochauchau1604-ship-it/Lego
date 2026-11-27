import { PageTransition } from "@/components/effects/page-transition";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Blocks, CalendarDays, ChevronRight, Hash, PackageCheck, PackageX, Users } from "lucide-react";
import { Reveal } from "@/components/effects/reveal";
import { ContactButtons } from "@/components/products/contact-buttons";
import { MobileContactBar } from "@/components/products/mobile-contact-bar";
import { Markdown } from "@/components/products/markdown";
import { Price, SaleBadge } from "@/components/products/price";
import { ProductCard } from "@/components/products/product-card";
import { ProductGallery } from "@/components/products/product-gallery";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { effectivePrice, formatNumber, formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

// ISR: trang tĩnh, làm mới tối đa mỗi giờ (và ngay lập tức khi admin sửa qua revalidatePath)
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Không tìm thấy sản phẩm" };
  const title = `${product.name}${product.set_number ? ` (#${product.set_number})` : ""}`;
  const description =
    product.short_description ?? `${product.name} — ${product.theme ?? ""} — giá ${formatPrice(effectivePrice(product))}`;
  const image = product.thumbnail ?? product.images[0];
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/products/${product.slug}`,
      images: image ? [{ url: image, width: 800, height: 800, alt: product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);
  const images = product.images.length ? product.images : product.thumbnail ? [product.thumbnail] : [];
  // Đưa thumbnail lên đầu để khớp ảnh ở card (cho hiệu ứng ảnh bay sang)
  const ordered = product.thumbnail && images.includes(product.thumbnail) ? [product.thumbnail, ...images.filter((i) => i !== product.thumbnail)] : images;
  const inStock = product.stock > 0;

  const specs = [
    { icon: Hash, label: "Mã bộ", value: product.set_number ?? "—" },
    { icon: Blocks, label: "Số mảnh", value: product.pieces != null ? formatNumber(product.pieces) : "—" },
    { icon: Users, label: "Độ tuổi", value: product.age_range ?? "—" },
    { icon: CalendarDays, label: "Năm phát hành", value: product.release_year?.toString() ?? "—" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.set_number ?? undefined,
    image: ordered.map((i) => (i.startsWith("http") ? i : `${siteConfig.url}${i}`)),
    description: product.short_description ?? undefined,
    category: product.theme ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: effectivePrice(product),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteConfig.url}/products/${product.slug}`,
    },
  };

  return (
    <PageTransition>
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-28 md:px-6 md:pt-28 lg:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Trang chủ</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href="/products" className="hover:text-foreground">Sản phẩm</Link>
        {product.theme && (
          <>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link href={`/products?theme=${encodeURIComponent(product.theme)}`} className="hover:text-foreground">{product.theme}</Link>
          </>
        )}
        <ChevronRight className="size-3.5" aria-hidden />
        <span aria-current="page" className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={ordered} name={product.name} slug={product.slug} />

        <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-wrap items-center gap-2">
            {product.theme && <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold tracking-wider uppercase">{product.theme}</span>}
            {product.category && (
              <Link href={`/products?category=${product.category.slug}`} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
                {product.category.name}
              </Link>
            )}
            <SaleBadge price={product.price} salePrice={product.sale_price} />
          </div>
          <h1 className="font-display text-3xl leading-[1.05] font-bold tracking-tight sm:text-4xl md:text-5xl">{product.name}</h1>
          {product.short_description && <p className="text-lg text-muted-foreground">{product.short_description}</p>}

          <div className="glass rounded-3xl p-5 sm:p-6">
            <Price price={product.price} salePrice={product.sale_price} size="lg" />
            <p className={`mt-3 inline-flex items-center gap-2 text-sm font-medium ${inStock ? "text-emerald-500" : "text-muted-foreground"}`}>
              {inStock ? <PackageCheck className="size-4" aria-hidden /> : <PackageX className="size-4" aria-hidden />}
              {inStock ? `Còn hàng (${product.stock})` : "Tạm hết hàng — liên hệ để đặt trước"}
            </p>
            <div className="mt-6">
              <ContactButtons productName={product.name} setNumber={product.set_number} />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {specs.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card/50 p-4">
                <dt className="flex items-center gap-2 text-xs tracking-wide text-muted-foreground uppercase">
                  <s.icon className="size-3.5" aria-hidden /> {s.label}
                </dt>
                <dd className="mt-1 font-display text-xl font-semibold">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {product.description && (
        <Reveal className="mt-20 max-w-3xl">
          <h2 className="font-display text-3xl font-bold">Mô tả sản phẩm</h2>
          <Markdown className="mt-4">{product.description}</Markdown>
        </Reveal>
      )}

      {related.length > 0 && (
        <section className="mt-16 md:mt-24" aria-labelledby="related-heading">
          <Reveal>
            <h2 id="related-heading" className="font-display text-3xl font-bold md:text-4xl">Sản phẩm liên quan</h2>
          </Reveal>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {related.map((p, i) => (
              <li key={p.id}>
                <Reveal delay={i * 0.06} className="h-full">
                  <ProductCard product={p} />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
      <MobileContactBar name={product.name} setNumber={product.set_number} price={product.price} salePrice={product.sale_price} />
    </PageTransition>
  );
}
