import AstroMagicProduct from "@/components/astro-magic/AstroMagicProduct";

export const dynamic = "force-dynamic";

export default async function AstroMagicProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AstroMagicProduct page="calendar" slug={slug} />;
}
