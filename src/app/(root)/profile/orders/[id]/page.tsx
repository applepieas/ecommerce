import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/utils";
import { getOrder } from "@/lib/actions/order";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Package, MapPin, CreditCard, AlertCircle } from "lucide-react";
import OrderItemsList from "@/components/profile/OrderItemsList";

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirectTo=/profile/orders/${id}`);
  }

  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  // Basic security check: ensure the order belongs to the user
  if (order.userId !== user.id) {
    notFound();
  }

  // Return Eligibility Logic: 30 days
  const ORDER_DATE = new Date(order.createdAt);
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const isReturnable = Date.now() - ORDER_DATE.getTime() <= THIRTY_DAYS_MS;

  const deliveryAddress = order.deliveryAddress as any; // Cast generic json to expected shape

  return (
    <div className="min-h-screen bg-light-100 pb-20 pt-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/profile?tab=orders"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-black"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Orders
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">

          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Main Content (Items) */}
            <div className="md:col-span-2 space-y-6">
              <OrderItemsList items={order.items} />
            </div>

            {/* Sidebar (Summary & Address) */}
            <div className="md:col-span-1 space-y-8">

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Summary
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>{formatPrice(order.shippingPrice)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-medium text-gray-900 text-base">
                    <span>Total</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h2 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Delivery Address
                </h2>
                <address className="text-sm text-gray-500 not-italic">
                  <p className="text-gray-900 font-medium">{deliveryAddress.name}</p>
                  <p>{deliveryAddress.line1}</p>
                  {deliveryAddress.line2 && <p>{deliveryAddress.line2}</p>}
                  <p>{deliveryAddress.city}, {deliveryAddress.postalCode}</p>
                  <p>{deliveryAddress.country}</p>
                  <p className="mt-2">{deliveryAddress.phone}</p>
                </address>
              </div>

              {/* Return Section */}
              <div className="border-t border-gray-200 pt-6">
                {isReturnable ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      <p>You have until {new Date(ORDER_DATE.getTime() + THIRTY_DAYS_MS).toLocaleDateString()} to return items from this order.</p>
                    </div>
                    <button className="w-full rounded-full border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Return Item(s)
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    <p>Return window closed on {new Date(ORDER_DATE.getTime() + THIRTY_DAYS_MS).toLocaleDateString()}.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
