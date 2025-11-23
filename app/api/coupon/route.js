import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// 🟩 Verify Coupon API — Frontend se coupon code aata hai, yeh API check karke deta hai
export async function POST(request) {
  try {
    // 🔹 Clerk se userId nikal rahe hain (server-side sahi method)
    const { userId, has } = getAuth(request);

    // 🔹 Frontend se JSON body me coupon code receive kar rahe hain
    const { code } = await request.json();

    // ================================
    // 🟧 Step 1: Check if coupon exists
    // ================================
    const coupon = await prisma.coupon.findUnique({
      where: {
        code: code.toUpperCase(), // coupon codes always uppercase
      },
    });

    // 🔸 Agar coupon hi nahi mila
    if (!coupon) {
      return NextResponse.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    // 🔸 Coupon expire ho chuka hai?
    if (coupon.expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "Coupon expired" },
        { status: 404 }
      );
    }

    // ==========================================
    // 🟧 Step 2: Check "Only for new users" logic
    // ==========================================
    if (coupon.forNewUser) {
      // User ne pehle kitne orders kiye hain
      const userOrders = await prisma.order.count({
        where: { userId },
      });

      // Pehla order hi nahi → user new hai
      if (userOrders > 0) {
        return NextResponse.json(
          { error: "Coupon valid for new users only" },
          { status: 404 }
        );
      }
    }

    // ==========================================
    // 🟧 Step 3: Check "Members only" coupons
    // ==========================================
    if (coupon.forMember) {
      const isMember = has?.({ plan: "plus" }); // Clerk Plus Membership check

      if (!isMember) {
        return NextResponse.json(
          { error: "Coupon valid only for premium members" },
          { status: 404 }
        );
      }
    }

    // 🟢 Sab checks pass → Coupon valid
    return NextResponse.json({ coupon });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
