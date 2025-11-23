import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


// ===============================
// 🟩 POST → Add new address
// ===============================
export async function POST(request) {
    try {
        // 🔹 Clerk se logged-in user ka userId nikalna
        const { userId } = getAuth(request);
        const { address } = await request.json();

        // Address object me userId add kar diya
        address.userId = userId;

        // 🔹 Prisma se address create kar rahe hain
        const newAddress = await prisma.address.create({
            data: address
        });

        return NextResponse.json({ 
            newAddress, 
            message: "Address added successfully" 
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
}



// ===============================
// 🟦 GET → Fetch all addresses
// ===============================
export async function GET(request) {
    try {
        // 🔹 Clerk se logged-in user ka userId
        const { userId } = getAuth(request);

        // 🔹 User ke sare addresses fetch
        const addresses = await prisma.address.findMany({
            where: { userId }
        });

        return NextResponse.json({ addresses });

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
}
