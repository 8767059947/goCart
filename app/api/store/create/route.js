import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Store create karne ka API route (POST request)

export async function POST(request)        
{
    try {
        // 👉 Clerk se user ka authentication details nikal rahe hain
        const {userId} = getAuth(request);

        // 👉 Frontend se bheja gaya form-data read kar rahe hain
        const formData = await request.formData();

        // 👉 Form ke fields ko extract kar rahe hain
        const name = formData.get("name");
        const username = formData.get("username");
        const description = formData.get("description");
        const email = formData.get("email");
        const contact = formData.get("contact");
        const address = formData.get("address");
        const image = formData.get("image");

        // 👉 Check kar rahe hain ki koi required field missing toh nahi
        if(!name || !username || !description || !email || !contact || !address || !image)
        {
            return NextResponse.json({error: "missing store info"}, {status: 400});
        }

        // 👉 Check if user already registered a store before
        const store = await prisma.store.findFirst({
            where: { userId: userId }
        });

        // Agar pehle se store bana hua hai → uska status return karo
        if (store) {
            return NextResponse.json({ status: store.status });
        }

        // 👉 Check kar rahe hain ki username already kisi ne toh nahi liya
        const isUsernameTaken = await prisma.store.findFirst({
            where: { username: username.toLowerCase() }
        });

        if (isUsernameTaken) {
            return NextResponse.json({ error: "username already taken" }, { status: 400 });
        }

        // 👉 ImageKit par image upload karna (logo upload)
        const buffer = Buffer.from(await image.arrayBuffer());

        const response = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "logos"
        });

        // 👉 Image ko optimized URL me convert kar rahe hain
        const optimizedImage = imagekit.url({
            path: response.filePath,
            transformation: {
                quality: 'auto',
                format: 'webp',
                width: '512'
            }
        });

        // 👉 Ab store ko database me create kar rahe hain
        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                description,
                username: username.toLowerCase(),
                email,
                contact,
                address,
                logo: optimizedImage
            }
        });

        // 👉 Store ko user se link karna (User table me store ka relation)
        await prisma.user.update({
            where: { id: userId },
            data: { store: { connect: { id: newStore.id } } }
        });

        // 👉 Final success response
        return NextResponse.json({ message: "applied, waiting for approval" });

    } catch (error) {
        console.error(error);

        // 👉 Error aaya toh uska code ya message return kar do
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
}

//Check if user has already registered a store if yes then send status of store

export async function GET(request)
{
    try {
        // 👉 Clerk se user ka authentication details nikal rahe hain
        const {userId} = getAuth(request);

          // 👉 Check if user already registered a store before
        const store = await prisma.store.findFirst({
            where: { userId: userId }
        });

        // Agar pehle se store bana hua hai → uska status return karo
        if (store) {
            return NextResponse.json({ status: store.status });
        }
        return NextResponse.json({status: "not registered"});

    } catch (error) {
         console.error(error);

        // 👉 Error aaya toh uska code ya message return kar do
        return NextResponse.json(
            { error: error.code || error.message },
            { status: 400 }
        );
    }
}