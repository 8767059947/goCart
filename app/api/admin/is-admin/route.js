import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 🟩 Auth Admin → Check karta hai ki user Admin hai ya nahi
export async function GET(request) {
  try {
    // 🔹 Clerk se current logged-in user ka userId extract kar rahe hain
    const { userId } = getAuth(request);

    // 🔹 authAdmin function se check karte hain ki user admin hai ya nahi
    const isAdmin = await authAdmin(userId);

    // 🔸 Agar admin nahi mila → 401 Unauthorized response bhej do
    if (!isAdmin) {
      return NextResponse.json(
        { error: "not authorized" },
        { status: 401 }
      );
    }

    // 🟢 Agar admin hai → admin status return kar do
    return NextResponse.json({ isAdmin });

  } catch (error) {
    console.error(error);

    // 🔻 Try block me koi error aa gaya → error message frontend ko bhejo
    return NextResponse.json(
      { error: error.code || error.message },
      { status: 400 }
    );
  }
}
