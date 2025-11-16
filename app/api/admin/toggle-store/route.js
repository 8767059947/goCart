import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🟩 Toggle store isActive (Admin Only)
export async function POST(request) {
  try {
    // 🔹 Clerk se user identify kar rahe hain
    const { userId } = getAuth(request);

    // 🔹 Check if user is admin
    const isAdmin = await authAdmin(userId);

    // 🔸 Admin nahi hai → Deny access
    if (!isAdmin) {
      return NextResponse.json(
        { error: "not authorized" },
        { status: 401 }
      );
    }

    // 🔹 Client se storeId receive kar rahe hain
    const { storeId } = await request.json();

    // 🔸 Agar storeId missing hai
    if (!storeId) {
      return NextResponse.json(
        { error: "missing storeId" },
        { status: 400 }
      );
    }

    // 🔹 Database me store search kar rahe hain
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    // 🔸 Store nahi mila
    if (!store) {
      return NextResponse.json(
        { error: "store not found" },
        { status: 400 }
      );
    }

    // 🔹 Store ka isActive toggle kar rahe hain (true ⇄ false)
    await prisma.store.update({
      where: { id: storeId },
      data: { isActive: !store.isActive },
    });

    // 🟢 Success message
    return NextResponse.json({
      message: "Store status updated successfully",
      newStatus: !store.isActive
    });

  } catch (error) {
    console.error(error);

    // 🔻 Koi bhi error → 400 response
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
