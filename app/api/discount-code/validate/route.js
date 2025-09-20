import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Validate a discount code
export async function POST(request) {
    try {
        const auth = getAuth(request);
        const userId = auth.userId;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        // Find the discount code
        const discountCode = await prisma.discountCode.findUnique({
            where: { code },
            include: {
                user: true,
                product: true
            }
        });

        if (!discountCode) {
            return NextResponse.json({ 
                valid: false, 
                message: "Not a valid code" 
            });
        }

        // Check if code has expired
        if (new Date() > discountCode.expiresAt) {
            return NextResponse.json({ 
                valid: false, 
                message: "Code has expired" 
            });
        }

        // Check if code has already been used
        if (discountCode.isUsed) {
            return NextResponse.json({ 
                valid: false, 
                message: "Code has already been used" 
            });
        }

        // Mark code as used
        await prisma.discountCode.update({
            where: { id: discountCode.id },
            data: { isUsed: true }
        });

        return NextResponse.json({ 
            valid: true, 
            message: "Successful",
            discountCode: {
                code: discountCode.code,
                productId: discountCode.productId,
                productName: discountCode.product.name,
                userName: discountCode.user.name
            }
        });

    } catch (error) {
        console.error("Error validating discount code:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}