import { NextRequest, NextResponse } from "next/server";
import { getSellerSession } from "@/lib/seller-session";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const seller = await getSellerSession();
  if (!seller) return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.product.findFirst({ where: { id, sellerId: seller.id } });
  if (!existing) return NextResponse.json({ error: "Produkt nie znaleziony" }, { status: 404 });

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const category = formData.get("category") as string;
  const sizes = formData.get("sizes") as string;
  const colors = formData.get("colors") as string;
  const imageFile = formData.get("image") as File | null;

  let images = existing.images;

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const filename = `${seller.id}-${slug}-${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "images", "sellers");
    await mkdir(uploadDir, { recursive: true });
    const bytes = await imageFile.arrayBuffer();
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));
    images = JSON.stringify([`/images/sellers/${filename}`]);
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: name || existing.name,
      description: description || existing.description,
      price: price || existing.price,
      category: category || existing.category,
      images,
      sizes: sizes ?? existing.sizes,
      colors: colors ?? existing.colors,
    },
  });

  return NextResponse.json({ ok: true, product: { id: updated.id, slug: updated.slug } });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const seller = await getSellerSession();
  if (!seller) return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.product.findFirst({ where: { id, sellerId: seller.id } });
  if (!existing) return NextResponse.json({ error: "Produkt nie znaleziony" }, { status: 404 });

  // Usuń powiązane promocje i sprzedaże przed usunięciem produktu
  await prisma.promotedProduct.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
