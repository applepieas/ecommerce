import { getOrder } from "@/lib/actions/order";
import { CheckCircle, Package, Truck, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

// Define PageProps correctly for Next.js 15+ (if app uses it, search params are async)
// Assuming Next.js 14/15 based on "next": "16.1.6" in package.json
// In Next.js 15, searchParams is a Promise.

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrderConfirmationPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.orderId as string;
  const newAccount = resolvedSearchParams.newAccount === "true";

  if (!orderId) {
    redirect("/");
  }

  const order = await getOrder(orderId);

  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <p className="mt-2 text-gray-500">We couldn't find the order you're looking for.</p>
        <Link href="/" className="mt-6 rounded-full bg-black px-6 py-3 text-white hover:bg-gray-800">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
          Thank you for your order!
        </h1>
        <p className="mt-4 text-base text-gray-500">
          Order #<span className="font-mono text-black font-medium">{order.id.slice(0, 8)}</span> has been confirmed.
        </p>

        {newAccount && (
          <div className="mt-6 rounded-lg bg-blue-50 p-4 border border-blue-100">
            <h3 className="flex items-center justify-center gap-2 text-sm font-medium text-blue-800">
              Account Created Successfully
            </h3>
            <p className="mt-1 text-sm text-blue-600">
              Welcome to the club! We've created your account. Check your email to set a password.
            </p>
          </div>
        )}
      </div>

      <div className="mt-12 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-black">Order Details</h2>
          <span className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Items */}
        <div className="px-6 py-4">
          <ul className="divide-y divide-gray-100">
            {order.items.map((item: any) => (
              <li key={item.id} className="flex py-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                  {item.productVariant?.product?.images?.[0]?.url && (
                    <Image
                      src={item.productVariant.product.images[0].url}
                      alt="Product"
                      fill
                      className="object-cover object-center"
                    />
                  )}
                </div>
                <div className="ml-4 flex flex-1 flex-col z-10 w-full">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.productVariant?.product?.name}</h3>
                      <p>${item.priceAtPurchase}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.productVariant?.color?.name} / {item.productVariant?.size?.name}
                    </p>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <p className="text-gray-500">Qty {item.quantity}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 px-6 py-6 border-t border-gray-200">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <p>Subtotal</p>
            <p>${order.subtotal}</p>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <p>Shipping</p>
            <p>${order.shippingPrice}</p>
          </div>
          <div className="flex justify-between text-base font-bold text-black border-t border-gray-200 pt-4 mt-4">
            <p>Total</p>
            <p>${order.totalAmount}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full bg-black px-8 py-3 font-bold text-white hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
