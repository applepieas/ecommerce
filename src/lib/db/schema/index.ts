// ============================================
// Enums
// ============================================
export {
  addressTypeEnum,
  orderStatusEnum,
  paymentMethodEnum,
  paymentStatusEnum,
  discountTypeEnum,
} from "./enums";

// ============================================
// Auth tables (Better Auth compatible)
// ============================================
export { user, type User, type NewUser } from "./user";
export { session, type Session, type NewSession } from "./session";
export { account, type Account, type NewAccount } from "./account";
export {
  verification,
  type Verification,
  type NewVerification,
} from "./verification";
export { guest, type Guest, type NewGuest } from "./guest";

// ============================================
// Filters
// ============================================
export {
  genders,
  gendersRelations,
  insertGenderSchema,
  selectGenderSchema,
  type Gender,
  type NewGender,
  colors,
  colorsRelations,
  insertColorSchema,
  selectColorSchema,
  type Color,
  type NewColor,
  sizes,
  sizesRelations,
  insertSizeSchema,
  selectSizeSchema,
  type Size,
  type NewSize,
} from "./filters";

// ============================================
// Core Entities
// ============================================
export {
  brands,
  brandsRelations,
  insertBrandSchema,
  selectBrandSchema,
  type Brand,
  type NewBrand,
} from "./brands";

export {
  categories,
  categoriesRelations,
  insertCategorySchema,
  selectCategorySchema,
  type Category,
  type NewCategory,
} from "./categories";

export {
  addresses,
  addressesRelations,
  insertAddressSchema,
  selectAddressSchema,
  type Address,
  type NewAddress,
} from "./addresses";

export {
  products,
  productsRelations,
  insertProductSchema,
  selectProductSchema,
  type Product,
  type NewProduct,
} from "./products";

export {
  productVariants,
  productVariantsRelations,
  insertProductVariantSchema,
  selectProductVariantSchema,
  type ProductVariant,
  type NewProductVariant,
  type VariantDimensions,
} from "./variants";

export {
  productImages,
  productImagesRelations,
  insertProductImageSchema,
  selectProductImageSchema,
  type ProductImage,
  type NewProductImage,
} from "./product-images";

// ============================================
// Commerce
// ============================================
export {
  reviews,
  reviewsRelations,
  insertReviewSchema,
  selectReviewSchema,
  type Review,
  type NewReview,
} from "./reviews";

export {
  carts,
  cartsRelations,
  cartItems,
  cartItemsRelations,
  insertCartSchema,
  selectCartSchema,
  insertCartItemSchema,
  selectCartItemSchema,
  type Cart,
  type NewCart,
  type CartItem,
  type NewCartItem,
} from "./carts";

export {
  orders,
  ordersRelations,
  orderItems,
  orderItemsRelations,
  insertOrderSchema,
  selectOrderSchema,
  insertOrderItemSchema,
  selectOrderItemSchema,
  type Order,
  type NewOrder,
  type OrderItem,
  type NewOrderItem,
} from "./orders";

export {
  payments,
  paymentsRelations,
  insertPaymentSchema,
  selectPaymentSchema,
  type Payment,
  type NewPayment,
} from "./payments";

export {
  coupons,
  insertCouponSchema,
  selectCouponSchema,
  type Coupon,
  type NewCoupon,
} from "./coupons";

export {
  wishlists,
  wishlistsRelations,
  insertWishlistSchema,
  selectWishlistSchema,
  type Wishlist,
  type NewWishlist,
} from "./wishlists";

export {
  collections,
  collectionsRelations,
  productCollections,
  productCollectionsRelations,
  insertCollectionSchema,
  selectCollectionSchema,
  insertProductCollectionSchema,
  selectProductCollectionSchema,
  type Collection,
  type NewCollection,
  type ProductCollection,
  type NewProductCollection,
} from "./collections";
