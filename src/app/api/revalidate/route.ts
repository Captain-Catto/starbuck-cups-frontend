import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const tag = request.nextUrl.searchParams.get("tag");

  if (tag === "products") {
    // Revalidate all product-related pages
    revalidatePath("/[locale]", "page");
    revalidatePath("/[locale]/products", "page");
    revalidatePath("/[locale]/products/[slug]", "page");
  } else {
    // Revalidate everything
    revalidatePath("/", "layout");
  }

  return NextResponse.json({ revalidated: true, tag, now: Date.now() });
}
