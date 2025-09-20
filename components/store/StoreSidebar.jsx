'use client'
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon, CheckCircleIcon, XCircleIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const StoreSidebar = ({storeInfo}) => {

    const pathname = usePathname()
    const [matchCode, setMatchCode] = useState("")
    const [isValidating, setIsValidating] = useState(false)
    const [validationResult, setValidationResult] = useState(null)

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
    ]

    const validateCode = async () => {
        if (!matchCode.trim()) {
            toast.error("Please enter a code");
            return;
        }

        setIsValidating(true);
        setValidationResult(null);

        try {
            const response = await axios.post('/api/discount-code/validate', {
                code: matchCode.trim()
            });

            setValidationResult({
                valid: response.data.valid,
                message: response.data.message,
                discountCode: response.data.discountCode
            });

            if (response.data.valid) {
                toast.success("Successful");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error validating code:", error);
            setValidationResult({
                valid: false,
                message: "Not a valid code"
            });
            toast.error("Not a valid code");
        } finally {
            setIsValidating(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            validateCode();
        }
    };

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                <Image className="w-14 h-14 rounded-full shadow-md" src={storeInfo?.logo} alt="" width={80} height={80} />
                <p className="text-slate-700">{storeInfo?.name}</p>
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'}`}>
                            <link.icon size={18} className="sm:ml-5" />
                            <p className="max-sm:hidden">{link.name}</p>
                            {pathname === link.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                        </Link>
                    ))
                }
            </div>

            {/* Match Code Section */}
            <div className="px-4 py-3 border-t border-slate-200 max-sm:hidden">
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-slate-700">Match Code</h3>
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            value={matchCode}
                            onChange={(e) => setMatchCode(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter discount code"
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <button
                            onClick={validateCode}
                            disabled={isValidating || !matchCode.trim()}
                            className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isValidating ? 'Validating...' : 'Validate Code'}
                        </button>
                    </div>

                    {/* Validation Result */}
                    {validationResult && (
                        <div className={`flex items-center gap-2 p-2 rounded text-sm ${
                            validationResult.valid 
                                ? 'bg-green-50 text-green-800 border border-green-200' 
                                : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                            {validationResult.valid ? (
                                <CheckCircleIcon size={16} className="text-green-600" />
                            ) : (
                                <XCircleIcon size={16} className="text-red-600" />
                            )}
                            <span className="font-medium">{validationResult.message}</span>
                        </div>
                    )}

                    {/* Additional Info for Valid Codes */}
                    {validationResult?.valid && validationResult.discountCode && (
                        <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                            <p><strong>Product:</strong> {validationResult.discountCode.productName}</p>
                            <p><strong>Customer:</strong> {validationResult.discountCode.userName}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StoreSidebar