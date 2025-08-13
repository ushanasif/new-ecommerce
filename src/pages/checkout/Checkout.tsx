import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Button } from "../../components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../redux/hooks";
import { useGetShippingFeesQuery } from "../../redux/features/admin/adminApi";
import { usePostOrderMutation } from "../../redux/features/order/orderApi";
import zipcityBd from "zipcity-bd";
import toast from "react-hot-toast";
import type {
  DeliveryAddress,
  OrderItem,
} from "../../redux/features/order/orderType";

const districtToDivision: Record<string, string> = {
  // Dhaka Division
  Dhaka: "Dhaka",
  Faridpur: "Dhaka",
  Gazipur: "Dhaka",
  Gopalganj: "Dhaka",
  Kishoreganj: "Dhaka",
  Madaripur: "Dhaka",
  Manikganj: "Dhaka",
  Munshiganj: "Dhaka",
  Narayanganj: "Dhaka",
  Narshingdi: "Dhaka",
  Rajbari: "Dhaka",
  Shariatpur: "Dhaka",
  Tangail: "Dhaka",

  // Chittagong Division
  Chittagong: "Chittagong",
  Bandarban: "Chittagong",
  Brahmanbaria: "Chittagong",
  Comilla: "Chittagong",
  "Coxs Bazar": "Chittagong",
  Feni: "Chittagong",
  Khagrachari: "Chittagong",
  Lakshmipur: "Chittagong",
  Noakhali: "Chittagong",
  Rangamati: "Chittagong",

  // Other divisions...
  Rajshahi: "Rajshahi",
  Bogra: "Rajshahi",
  Joypurhat: "Rajshahi",
  Naogaon: "Rajshahi",
  Natore: "Rajshahi",
  Chapinawabganj: "Rajshahi",
  Pabna: "Rajshahi",
  Sirajganj: "Rajshahi",

  Khulna: "Khulna",
  Chuadanga: "Khulna",
  Jessore: "Khulna",
  Jinaidaha: "Khulna",
  Kustia: "Khulna",
  Magura: "Khulna",
  Meherpur: "Khulna",
  Narail: "Khulna",
  Satkhira: "Khulna",

  Barishal: "Barisal",
  Barguna: "Barisal",
  Bhola: "Barisal",
  Jhalokathi: "Barisal",
  Patuakhali: "Barisal",
  Pirojpur: "Barisal",

  Sylhet: "Sylhet",
  Hobiganj: "Sylhet",
  Moulvibazar: "Sylhet",
  Sunamganj: "Sylhet",

  Rangpur: "Rangpur",
  Dinajpur: "Rangpur",
  Gaibandha: "Rangpur",
  Kurigram: "Rangpur",
  Lalmonirhat: "Rangpur",
  Nilphamari: "Rangpur",
  Panchagarh: "Rangpur",
  Thakurgaon: "Rangpur",

  Mymensingh: "Mymensingh",
  Jamalpur: "Mymensingh",
  Netrakona: "Mymensingh",
  Sherpur: "Mymensingh",
};

const allDivisions = [...new Set(Object.values(districtToDivision))];

interface FormValues {
  phone: string;
  address: string;
  division: string;
  district: string;
  coupon?: string;
  paymentMethod: string;
}

export type CheckOutData = {
  customerName: string;
  customerEmail?: string;
  customerId: string;
  phone: string;
  cuopon?: string;
  items: OrderItem[];
  totalPrice: number;
  paymentMethod: "cod" | "ssl" | "cash" | "card";
  deliveryFee: number;
  deliveryAddress: DeliveryAddress;
};

const CheckoutForm: React.FC = () => {
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const locationData = zipcityBd?.data;

  // Corrected destructuring for shipping fees with type assertion
  const {
    data: shippingFeeResponse, // This 'data' is now of type ShippingFeeApiResponse
    isLoading: isShippingFeeLoading,
    error: shippingFeeError,
  } = useGetShippingFeesQuery();

  // Access shippingFee and shippingFeeOutside from the nested 'data' property with type assertion
  const shippingFee = (shippingFeeResponse as any)?.data?.shippingFee || 0;
  const shippingFeeOutside =
    (shippingFeeResponse as any)?.data?.shippingFeeOutside || 0;

  const [postOrder, { isLoading }] = usePostOrderMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      paymentMethod: "cash",
    },
  });

  const location = useLocation();
  // Explicitly type cartItems
  const { cartItems, subtotal } = (location.state || {}) as {
    cartItems?: OrderItem[];
    subtotal?: number;
  };
  const totalPrice = subtotal || 0;

  const deliveryFee =
    selectedDivision === "Dhaka" ? shippingFee : shippingFeeOutside;
  const grandTotal = Math.round(totalPrice + deliveryFee);

  const filteredDistricts = Object.keys(districtToDivision).filter(
    (district) => districtToDivision[district] === selectedDivision
  );

  // Replace the existing citiesForDistrict declaration with:
  const citiesForDistrict: string[] =
    selectedDistrict && locationData?.[selectedDistrict]
      ? Array.from(
          new Set(
            locationData[selectedDistrict]
              .map((item) => item.city)
              .filter(Boolean)
              .map(String)
          )
        )
      : [];

  const clearCart = () => {
    localStorage.removeItem("cart");
    window.dispatchEvent(new CustomEvent("cartUpdated")); // Notify other components
  };

  if (!cartItems || cartItems.length === 0) {
    return <p>No item selected for checkout.</p>;
  }

  const onSubmit = async (data: FormValues) => {
    if (!user?._id) {
      toast.error("Please login to place an order");
      return;
    }

    // Validation checks
    if (!selectedDivision) {
      toast.error("Please select a division");
      return;
    }

    if (!selectedDistrict) {
      toast.error("Please select a district");
      return;
    }

    // Fix empty OwnerId in cart items - use a default ObjectId or user ID
    const processedCartItems = cartItems.map((item) => {
      const processedItem = { ...item };
      // If OwnerId is empty string or missing, use user's ID as fallback
      if (!processedItem.OwnerId || processedItem.OwnerId === "") {
        processedItem.OwnerId = user._id; // Use current user's ID as fallback
      }
      return processedItem;
    });

    const checkoutData: CheckOutData = {
      customerName: user?.name || "",
      customerEmail: user?.email || "",
      customerId: user._id,
      phone: data.phone,
      cuopon: data.coupon || "", // Make sure it's not undefined
      items: processedCartItems, // Use processed items
      totalPrice: grandTotal,
      paymentMethod: (data.paymentMethod || "cash") as
        | "cod"
        | "ssl"
        | "cash"
        | "card",
      deliveryFee: deliveryFee,
      deliveryAddress: {
        division: selectedDivision,
        district: selectedDistrict,
        city: selectedCity,
        addressDetails: data.address,
      },
    };
    console.log(checkoutData);
    try {
      const response = await postOrder(checkoutData).unwrap();

      if (response.data?.url) {
        toast.success("Order received, redirecting to payment...");
        clearCart(); // Clear cart before redirecting
        window.location.href = response.data.url; // Redirect to SSL payment
      } else {
        toast.success("Order placed successfully!");
        clearCart(); // Clear cart for Cash on Delivery
        navigate("/order-success"); // Navigate to a success page
      }
    } catch (error) {
      console.error("Order placement failed:", error);
      // More detailed error handling
      if (error && typeof error === "object" && "data" in error) {
        const errorData = (error as any).data;
        if (errorData?.message) {
          toast.error(`Order failed: ${errorData.message}`);
        } else {
          toast.error("Failed to place order. Please try again.");
        }
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 space-y-6">
      {/* Total Price Summary */}
      <Card className="shadow-md rounded-2xl bg-white">
        <CardHeader>
          <CardTitle className="text-xl">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Total Price</span>
            <span>৳ {Math.round(totalPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            {isShippingFeeLoading ? (
              <span>Loading...</span>
            ) : shippingFeeError ? (
              <span className="text-red-500">Error loading fee</span>
            ) : (
              <span>৳ {deliveryFee}</span>
            )}
          </div>
          <hr />
          <div className="flex justify-between font-semibold text-base">
            <span>Grand Total</span>
            <span>৳ {grandTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Phone */}
            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^01[3-9]\d{8}$/,
                    message: "Invalid Bangladeshi phone number",
                  },
                })}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1">
              <Label htmlFor="address">Shipping Address</Label>
              <Input
                id="address"
                placeholder="Street, house, area..."
                {...register("address", { required: "Address is required" })}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            {/* Division */}
            <div className="space-y-1">
              <Label>Division</Label>
              <Select
                onValueChange={(value) => {
                  setSelectedDivision(value);
                  setSelectedDistrict("");
                  setValue("division", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Select division"
                    defaultValue={watch("division")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {allDivisions.map((division) => (
                    <SelectItem key={division} value={division}>
                      {division}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedDivision && (
                <p className="text-sm text-red-500">Division is required</p>
              )}
            </div>

            {/* District */}
            <div className="space-y-1">
              <Label>District</Label>
              <Select
                disabled={!selectedDivision}
                onValueChange={(value) => {
                  setSelectedDistrict(value);
                  setValue("district", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedDivision
                        ? "Select district"
                        : "Select division first"
                    }
                    defaultValue={watch("district")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDivision && !selectedDistrict && (
                <p className="text-sm text-red-500">District is required</p>
              )}
            </div>

            {/* City / Thana */}
            <div className="space-y-1">
              <Label>City</Label>
              <Select
                disabled={!selectedDistrict}
                onValueChange={(value) => {
                  setSelectedCity(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedDistrict ? "Select city" : "Select district first"
                    }
                    defaultValue={selectedCity}
                  />
                </SelectTrigger>
                <SelectContent>
                  {citiesForDistrict.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDistrict && !selectedCity && (
                <p className="text-sm text-red-500">City is required</p>
              )}
            </div>

            {/* Coupon */}
            <div className="space-y-1">
              <Label htmlFor="coupon">Coupon Code (Optional)</Label>
              <Input
                id="coupon"
                placeholder="e.g. SAVE20"
                {...register("coupon")}
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup
                defaultValue="cash"
                onValueChange={(value) => setValue("paymentMethod", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash on Delivery</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ssl" id="ssl" />
                  <Label htmlFor="ssl">Bkash/Nagad/Rocket</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full mt-4">
              {isLoading ? "Placing order..." : "Place Order"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CheckoutForm;
