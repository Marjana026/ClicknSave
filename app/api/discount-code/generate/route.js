import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Generate a unique discount code
export async function POST(request) {
    try {
        const auth = getAuth(request);
        const userId = auth.userId;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        // Check if user exists, create if not
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userExists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Generate a unique alphanumeric code
        const generateCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 8; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };

        let code;
        let isUnique = false;
        
        // Ensure the code is unique
        while (!isUnique) {
            code = generateCode();
            const existingCode = await prisma.discountCode.findUnique({
                where: { code }
            });
            if (!existingCode) {
                isUnique = true;
            }
        }

        // Set expiration to 24 hours from now
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Create the discount code in database
        const discountCode = await prisma.discountCode.create({
            data: {
                code,
                userId,
                productId,
                expiresAt
            }
        });

        return NextResponse.json({ 
            code: discountCode.code,
            expiresAt: discountCode.expiresAt
        });

    } catch (error) {
        console.error("Error generating discount code:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}