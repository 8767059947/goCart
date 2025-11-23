import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🟩 GET Route → Saare active stores ke products fetch karta hai
export async function GET(request) {
    try {

        // 🔹 Saare products fetch kar rahe hain jinka inStock = true ho
        // 🔹 Saath me product ki ratings + user info + store info bhi include
        let products = await prisma.product.findMany({
            where: { inStock: true },
            include: {
                rating: {
                    select: {
                        createdAt: true,
                        rating: true,
                        review: true,
                        user: { select: { name: true, image: true } }
                    }
                },
                store: true, // product kis store ka hai → poora store object milega
            },
            orderBy: { createdAt: 'desc' } // latest products pehle
        });

        // 🟥 Agar store inactive hai (isActive: false)
        // toh us store ka product user ko nahi dikhayenge
        products = products.filter(product => product.store.isActive);

        // 🟢 Final response
        return NextResponse.json({ products });

    } catch (error) {
        console.error(error);

        // 🔻 Error case → proper error message with status 400
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
}
