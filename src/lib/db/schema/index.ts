// Auth tables (Better Auth compatible)
export { user, type User, type NewUser } from "./user";
export { session, type Session, type NewSession } from "./session";
export { account, type Account, type NewAccount } from "./account";
export {
  verification,
  type Verification,
  type NewVerification,
} from "./verification";

// Guest session table
export { guest, type Guest, type NewGuest } from "./guest";

// Product tables
export { products, type Product, type NewProduct } from "./products";
