import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/utils";
import { getWishlist } from "@/lib/actions/wishlist";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { getUserOrders } from "@/lib/actions/order";

// Force dynamic rendering since we depend on cookies/auth
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  // Fetch wishlist for the tabs
  const wishlist = await getWishlist(user.id);
  // Fetch orders
  const orders = await getUserOrders(user.id);

  return (
    <div className="min-h-screen bg-light-100 pb-20">
      <ProfileHeader
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
        }}
      />

      <ProfileTabs
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
        }}
        initialWishlist={wishlist}
        initialOrders={orders}
      />
    </div>
  );
}
