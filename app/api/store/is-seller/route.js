import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// 🟩 GET route → Check karega ki user Seller hai ya nahi
export async function GET(request) {
    try {
        // 🔹 Clerk se current logged-in user ka userId nikal rahe hai
        const { userId } = getAuth(request);

        // 🔹 Middleware call karke check karte hai ki user seller hai ya nahi
        const isSeller = await authSeller(userId);

        // 🔸 Agar seller nahi hai to unauthorized response bhej do
        if (!isSeller) {
            return NextResponse.json(
                { error: "Not Authorized" },
                { status: 401 }
            );
        }

        // 🔹 Agar user seller hai → uska store info database se fetch karo (Prisma)
        const storeInfo = await prisma.store.findUnique({
            where: { userId }
        });

        // 🟢 Seller + store info dono response me bhej rahe hai
        return NextResponse.json({ isSeller, storeInfo });

    } catch (error) {
        console.error(error);

        // 🔻 Koi bhi error aaye to yeh response return hoga
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
}
