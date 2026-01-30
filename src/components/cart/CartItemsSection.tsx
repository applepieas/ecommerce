import { CartItemDTO } from "@/lib/actions/cart";
import CartItemRow from "./CartItemRow";

export default function CartItemsSection({
  initialItems,
}: {
  initialItems: CartItemDTO[];
}) {
  return (
    <div className="flex flex-col">
      {initialItems.map((item) => (
        <CartItemRow key={item.id} item={item} />
      ))}
    </div>
  );
}
