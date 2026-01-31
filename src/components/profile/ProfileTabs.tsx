"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { FavoritesTab } from "./FavoritesTab";
import { Wishlist } from "@/lib/db/schema/wishlists";

import Link from "next/link"; // Ensure Link is imported if used (not used here but OrdersTab uses it)
import OrdersTab from "./OrdersTab";

interface ProfileTabsProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  initialWishlist: any[];
  initialOrders: any[];
}

export default function ProfileTabs({ user, initialWishlist, initialOrders }: ProfileTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam || "orders");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/profile?tab=${tab}`, { scroll: false });
  };

  const tabs = [
    { id: "orders", label: "My Orders" },
    { id: "favorites", label: "Favorites" },
    { id: "details", label: "My Details" },
    { id: "payment", label: "Payment Methods" },
    { id: "address", label: "Address Book" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Tabs Navigation */}
      <div className="border-b border-light-300">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-dark-900 text-dark-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              )}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === "orders" && (
          <OrdersTab orders={initialOrders} />
        )}

        {activeTab === "favorites" && (
          <FavoritesTab
            key={initialWishlist.length} // Force re-mount if length changes
            wishlist={initialWishlist}
            userId={user.id}
          />
        )}

        {activeTab === "details" && (
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-4 mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {(activeTab === "payment" || activeTab === "address") && (
          <div className="text-center py-12 text-gray-500">
            <p>This feature is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
