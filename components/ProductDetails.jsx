'use client'

import { StarIcon, TagIcon, EarthIcon, CreditCardIcon, UserIcon, CopyIcon, CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const { userId } = useAuth();
    const router = useRouter();

    const [mainImage, setMainImage] = useState(product.images[0]);
    const [discountCode, setDiscountCode] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateDiscountCode = async () => {
        if (!userId) {
            toast.error("Please login to generate discount code");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await axios.post('/api/discount-code/generate', {
                productId
            });
            
            setDiscountCode(response.data.code);
            toast.success("Discount code generated successfully!");
        } catch (error) {
            console.error("Error generating discount code:", error);
            toast.error(error.response?.data?.error || "Failed to generate discount code");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        if (discountCode) {
            try {
                await navigator.clipboard.writeText(discountCode);
                setCopied(true);
                toast.success("Code copied to clipboard!");
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                toast.error("Failed to copy code");
            }
        }
    };

    const averageRating = product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length;
    
    return (
        <div className="flex max-lg:flex-col gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3">
                <div className="flex sm:flex-col gap-3">
                    {product.images.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(product.images[index])} className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer">
                            <Image src={image} className="group-hover:scale-103 group-active:scale-95 transition" alt="" width={45} height={45} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
                    <Image src={mainImage} alt="" width={250} height={250} />
                </div>
            </div>
            <div className="flex-1">
                <h1 className="text-3xl font-semibold text-slate-800">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{product.rating.length} Reviews</p>
                </div>
                <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                    <p> {currency}{product.price} </p>
                    <p className="text-xl text-slate-500 line-through">{currency}{product.mrp}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                    <TagIcon size={14} />
                    <p>Save {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% right now</p>
                </div>
                <div className="flex flex-col gap-5 mt-10">
                    {!discountCode ? (
                        <button 
                            onClick={generateDiscountCode} 
                            disabled={isGenerating}
                            className="bg-green-600 text-white px-10 py-3 text-sm font-medium rounded hover:bg-green-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? 'Generating...' : 'Redeem Discount Code'}
                        </button>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <p className="text-lg text-slate-800 font-semibold">Your Discount Code:</p>
                            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <code className="text-lg font-mono font-bold text-green-800 flex-1">
                                    {discountCode}
                                </code>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                                >
                                    {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <p className="text-sm text-slate-600">
                                Share this code with the store owner to redeem your discount!
                            </p>
                        </div>
                    )}
                </div>
                <hr className="border-gray-300 my-5" />
                <div className="flex flex-col gap-4 text-slate-500">
                    <p className="flex gap-3"> <EarthIcon className="text-slate-400" /> Free shipping worldwide </p>
                    <p className="flex gap-3"> <CreditCardIcon className="text-slate-400" /> 100% Secured Payment </p>
                    <p className="flex gap-3"> <UserIcon className="text-slate-400" /> Trusted by top brands </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails