"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Package, ChevronRight, Clock, CheckCircle } from "lucide-react";

interface OrdersTabProps {
  orders: any[]; // Using any for simplicity as DTO types are complex, but structure is known
}

export default function OrdersTab({ orders }: OrdersTabProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-6">
          <Package className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
        <p className="mt-1 text-gray-500">
          When you place an order, it will appear here.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-800"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
      <div className="space-y-6">
        {orders.map((order) => {
          // Get the first item's image for the preview
          const firstItem = order.items[0];
          const firstImage = firstItem?.productVariant?.product?.images?.find(
            (img: any) => img.isPrimary
          ) || firstItem?.productVariant?.product?.images?.[0];

          return (
            <div
              key={order.id}
              className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row">
                {/* Order Info Header (Mobile) / Sidebar (Desktop) */}
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="font-medium text-gray-900 mt-1">
                        Total: {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Status Badge */}
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {order.status === 'delivered' && <CheckCircle className="mr-1 h-3 w-3" />}
                        {order.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="mt-4 flex gap-4 overflow-x-auto pb-2 sm:pb-0">
                    {order.items.map((item: any) => {
                      const img = item.productVariant?.product?.images?.find(
                        (i: any) => i.isPrimary
                      ) || item.productVariant?.product?.images?.[0];
                      return (
                        <div key={item.id} className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                          {img ? (
                            <Image
                              src={img.url}
                              alt={item.productVariant?.product?.name || "Product"}
                              fill
                              className="object-cover object-center"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-400">
                              No Img
                            </div>
                          )}
                          <span className="absolute bottom-0 right-0 rounded-tl-md bg-black px-1.5 py-0.5 text-[10px] font-medium text-white">
                            x{item.quantity}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-center border-t border-gray-200 bg-gray-50 p-6 sm:w-48 sm:border-l sm:border-t-0">
                  <Link
                    href={`/profile/orders/${order.id}`}
                    className="flex items-center text-sm font-medium text-black hover:underline"
                  >
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
