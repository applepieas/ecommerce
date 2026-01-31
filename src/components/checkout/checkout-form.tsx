"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder, CreateOrderInput, createOrderSchema } from "@/lib/actions/order";
import { Truck, CreditCard, UserPlus, CheckCircle } from "lucide-react";

interface CheckoutFormProps {
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export default function CheckoutForm({ user }: CheckoutFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Form State
  const [formData, setFormData] = useState<CreateOrderInput>({
    deliveryAddress: {
      name: user?.name || "",
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      country: "US", // Default
      phone: "",
    },
    deliveryMethod: "standard",
    paymentMethod: "card",
    guestEmail: user ? undefined : "",
    createAccount: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (section: keyof CreateOrderInput, field: string, value: any) => {
    setFormData((prev) => {
      if (section === "deliveryAddress") {
        return {
          ...prev,
          deliveryAddress: {
            ...prev.deliveryAddress,
            [field]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
    // Clear error for this field
    if (errors[field] || errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGlobalError("");
    setErrors({});

    // 1. Client-side Validation using Zod
    const result = createOrderSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        // Map zod path to field names
        // e.g. ["deliveryAddress", "city"] -> "deliveryAddress.city"
        const path = err.path.join(".");
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);

      // Scroll to top or first error
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      // 2. Server Action
      const response = await createOrder(result.data);

      if (!response.success) {
        setGlobalError(response.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // 3. Redirect on Success
      if (response.orderId) {
        // Construct URL
        const params = new URLSearchParams();
        params.set("orderId", response.orderId);
        if (formData.createAccount) {
          params.set("newAccount", "true");
        }
        router.push(`/checkout/confirmation?${params.toString()}`);
      }
    } catch (err) {
      console.error(err);
      setGlobalError("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {globalError && (
        <div className="rounded-md bg-red-50 p-4 text-red-600 border border-red-200">
          {globalError}
        </div>
      )}

      {/* Guest Email (only if not logged in) */}
      {!user && (
        <section>
          <h3 className="mb-4 text-lg font-semibold text-black">Contact Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.guestEmail}
              onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
              className={`w-full rounded-md border ${errors.guestEmail ? "border-red-500" : "border-gray-300"} px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black`}
              placeholder="you@example.com"
            />
            {errors.guestEmail && <p className="mt-1 text-sm text-red-500">{errors.guestEmail}</p>}
          </div>
        </section>
      )}

      {/* Delivery Address */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-black">Delivery Address</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.deliveryAddress.name}
              onChange={(e) => handleInputChange("deliveryAddress", "name", e.target.value)}
              className={`w-full rounded-md border ${errors["deliveryAddress.name"] ? "border-red-500" : "border-gray-300"} px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black`}
            />
            {errors["deliveryAddress.name"] && <p className="mt-1 text-sm text-red-500">{errors["deliveryAddress.name"]}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input
              type="text"
              value={formData.deliveryAddress.line1}
              onChange={(e) => handleInputChange("deliveryAddress", "line1", e.target.value)}
              className={`w-full rounded-md border ${errors["deliveryAddress.line1"] ? "border-red-500" : "border-gray-300"} px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black`}
              placeholder="Street address"
            />
            {errors["deliveryAddress.line1"] && <p className="mt-1 text-sm text-red-500">{errors["deliveryAddress.line1"]}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={formData.deliveryAddress.line2 || ""}
              onChange={(e) => handleInputChange("deliveryAddress", "line2", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={formData.deliveryAddress.city}
              onChange={(e) => handleInputChange("deliveryAddress", "city", e.target.value)}
              className={`w-full rounded-md border ${errors["deliveryAddress.city"] ? "border-red-500" : "border-gray-300"} px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black`}
            />
            {errors["deliveryAddress.city"] && <p className="mt-1 text-sm text-red-500">{errors["deliveryAddress.city"]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              type="text"
              value={formData.deliveryAddress.postalCode}
              onChange={(e) => handleInputChange("deliveryAddress", "postalCode", e.target.value)}
              className={`w-full rounded-md border ${errors["deliveryAddress.postalCode"] ? "border-red-500" : "border-gray-300"} px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black`}
            />
            {errors["deliveryAddress.postalCode"] && <p className="mt-1 text-sm text-red-500">{errors["deliveryAddress.postalCode"]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={formData.deliveryAddress.country}
              onChange={(e) => handleInputChange("deliveryAddress", "country", e.target.value)}
              className={`w-full rounded-md border ${errors["deliveryAddress.country"] ? "border-red-500" : "border-gray-300"} px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black bg-white`}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
            {errors["deliveryAddress.country"] && <p className="mt-1 text-sm text-red-500">{errors["deliveryAddress.country"]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.deliveryAddress.phone}
              onChange={(e) => handleInputChange("deliveryAddress", "phone", e.target.value)}
              className={`w-full rounded-md border ${errors["deliveryAddress.phone"] ? "border-red-500" : "border-gray-300"} px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black`}
            />
            {errors["deliveryAddress.phone"] && <p className="mt-1 text-sm text-red-500">{errors["deliveryAddress.phone"]}</p>}
          </div>
        </div>
      </section>

      {/* Delivery Method */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-black">Delivery Method</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${formData.deliveryMethod === "standard" ? "border-black ring-1 ring-black" : "border-gray-300"}`}>
            <input
              type="radio"
              name="deliveryMethod"
              value="standard"
              checked={formData.deliveryMethod === "standard"}
              onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value as any })}
              className="sr-only"
            />
            <span className="flex flex-1">
              <span className="flex flex-col">
                <span className="block text-sm font-medium text-black">Standard Delivery</span>
                <span className="mt-1 flex items-center text-sm text-gray-500">
                  <Truck className="mr-2 h-4 w-4" /> 3-5 Business Days
                </span>
                <span className="mt-6 text-sm font-medium text-black">$5.00</span>
              </span>
            </span>
            <CheckCircle className={`h-5 w-5 text-black ${formData.deliveryMethod === "standard" ? "visible" : "invisible"}`} />
          </label>

          <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${formData.deliveryMethod === "express" ? "border-black ring-1 ring-black" : "border-gray-300"}`}>
            <input
              type="radio"
              name="deliveryMethod"
              value="express"
              checked={formData.deliveryMethod === "express"}
              onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value as any })}
              className="sr-only"
            />
            <span className="flex flex-1">
              <span className="flex flex-col">
                <span className="block text-sm font-medium text-black">Express Delivery</span>
                <span className="mt-1 flex items-center text-sm text-gray-500">
                  <Truck className="mr-2 h-4 w-4" /> 1-2 Business Days
                </span>
                <span className="mt-6 text-sm font-medium text-black">$15.00</span>
              </span>
            </span>
            <CheckCircle className={`h-5 w-5 text-black ${formData.deliveryMethod === "express" ? "visible" : "invisible"}`} />
          </label>
        </div>
      </section>

      {/* Payment Method */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-black">Payment</h3>
        <div className="space-y-4">
          <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${formData.paymentMethod === "card" ? "border-black ring-1 ring-black" : "border-gray-300"}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={formData.paymentMethod === "card"}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
              className="sr-only"
            />
            <span className="flex flex-1">
              <span className="flex flex-col">
                <span className="block text-sm font-medium text-black">Credit or Debit Card</span>
              </span>
            </span>
            <CreditCard className="h-5 w-5 text-gray-400" />
          </label>

          {formData.paymentMethod === "card" && (
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Card Number"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                This is a secure 128-bit SSL encrypted payment. (Simulated)
              </p>
            </div>
          )}

          <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${formData.paymentMethod === "paypal" ? "border-black ring-1 ring-black" : "border-gray-300"}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={formData.paymentMethod === "paypal"}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
              className="sr-only"
            />
            <span className="flex flex-1">
              <span className="flex flex-col">
                <span className="block text-sm font-medium text-black">PayPal</span>
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* Guest Account Creation */}
      {!user && (
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="createAccount"
                type="checkbox"
                checked={formData.createAccount}
                onChange={(e) => setFormData({ ...formData, createAccount: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="createAccount" className="font-medium text-black">
                Proceed and Create an Account
              </label>
              <p className="text-gray-500">
                Save your information for faster checkout next time, track your order, and get exclusive offers.
              </p>
            </div>
          </div>
        </section>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-black py-4 text-lg font-bold text-white hover:bg-gray-800 disabled:bg-gray-400"
      >
        {isSubmitting ? "Processing..." : "Place Order"}
      </button>

      <p className="text-center text-xs text-gray-500">
        By placing your order, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
