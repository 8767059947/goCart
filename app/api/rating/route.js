import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";  // ✅ Correct import
import { NextResponse } from "next/server";


// 🟩 Add new rating (user ek product ke liye rating/feedback deta hai)
export async function POST(request) {
  try {
    // 🔹 Clerk se logged-in user ka userId nikal rahe hain
    const { userId } = getAuth(request);

    // 🔹 Request body se data nikal rahe hain
    const { orderId, productId, rating, review } = await request.json();

    // 🔸 Check kar rahe hain ki order exist karta hai ya nahi (aur user ka hi hai)
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    // ❌ Agar order nahi mila to user ne wo product order hi nahi kiya
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 🔸 Check kar rahe hain ki user ne already rating di hai ya nahi
    const isAlreadyRated = await prisma.rating.findFirst({
      where: { productId, orderId },
    });

    // ❌ Agar already rating di gayi hai → error return
    if (isAlreadyRated) {
      return NextResponse.json(
        { message: "Product already rated" },
        { status: 400 }
      );
    }

    // ✅ Naya rating create kar rahe hain
    const response = await prisma.rating.create({
      data: { userId, productId, rating, review, orderId },
    });

    // 🟢 Success response bhej rahe hain
    return NextResponse.json({
      message: "Rating added successfully",
      rating: response,
    });
  } catch (error) {
    console.error(error);

    // 🔻 Agar kuch bhi unexpected error aaya to ye return hoga
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}



// 🟦 Get all ratings for a user (ek user ke saare diye gaye ratings)
export async function GET(request) {
  try {
    // 🔹 Clerk se userId le rahe hain
    const { userId } = getAuth(request);

    // ❌ Agar user logged-in nahi hai
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized Access" },
        { status: 401 }
      );
    }

    // 🔹 Prisma se user ke sab ratings fetch kar rahe hain
    const ratings = await prisma.rating.findMany({
      where: { userId },
    });

    // 🟢 Success response me sab ratings bhej do
    return NextResponse.json({ ratings });
  } catch (error) {
    console.error(error);

    // 🔻 Unexpected error case
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
