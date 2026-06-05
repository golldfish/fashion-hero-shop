import { NextRequest, NextResponse } from "next/server";
import { getSellerSession } from "@/lib/seller-session";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const seller = await getSellerSession();
  if (!seller) return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: { promotions: { where: { isActive: true } } },
    orderBy: { createdAt: "desc" },
  });

  const activePromotionsCount = products.filter((p) => p.promotions.length > 0).length;

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      category: p.category,
      description: p.description,
      images: JSON.parse(p.images) as string[],
      sizes: JSON.parse(p.sizes) as string[],
      colors: JSON.parse(p.colors) as { name: string; hex: string }[],
      isPromoted: p.promotions.length > 0,
    })),
    activePromotionsCount,
    canAddMorePromotions: activePromotionsCount < 3,
  });
}

export async function POST(req: NextRequest) {
  const seller = await getSellerSession();
  if (!seller) return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const sizes = formData.get("sizes") as string;
  const colors = formData.get("colors") as string;
  const imageFile = formData.get("image") as File | null;

  if (!name || !description || !price || !category) {
    return NextResponse.json({ error: "Brakujące wymagane pola" }, { status: 400 });
  }

  let imagePath = "/images/sellers/placeholder.jpg";

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const filename = `${seller.id}-${slug}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "images", "sellers");
    await mkdir(uploadDir, { recursive: true });
    const bytes = await imageFile.arrayBuffer();
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));
    imagePath = `/images/sellers/${filename}`;
  }

  const slug = `${seller.id.slice(-6)}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now()}`;

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      category,
      images: JSON.stringify([imagePath]),
      sizes: sizes || "[]",
      colors: colors || "[]",
      sellerId: seller.id,
    },
  });

  return NextResponse.json({ ok: true, product: { id: product.id, slug: product.slug } }, { status: 201 });
}
