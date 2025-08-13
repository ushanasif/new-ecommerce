import { skipToken } from "@reduxjs/toolkit/query";
import { useGetOrderQuery } from "../../../../redux/features/order/orderApi";
import { useAppSelector } from "../../../../redux/hooks";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Card, CardContent } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { format } from "date-fns";
import { useState } from "react";
import ViewDetails from "./ViewDetails";
import type {
  OrderItem,
  OrderRequestPayload,
} from "../../../../redux/features/order/orderType";
import { useNavigate } from "react-router-dom";
import type { CheckOutData } from "../../../checkout/Checkout";

import RefundModal from "./RefundModal";
import CancelOrderModal from "./CancelOrderModal";
import { cn } from "../../../../lib/utils";
import ReviewModal from "./ReviewModal";

const statusTabs = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const MyOrders = () => {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const { data: ordersRes, isLoading } = useGetOrderQuery(
    user?._id ?? skipToken
  );
  const orders = ordersRes?.data || [];

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [openOrder, setOpenOrder] = useState<OrderRequestPayload | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string | null>(
    ""
  );
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelOrderModalOpen] = useState(false);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const filteredOrders = orders.filter((order: OrderRequestPayload) => {
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter.toLowerCase();
    const matchesSearch =
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (order: OrderRequestPayload) => {
    setOpenOrder(order);
    setIsModalOpen(true);
  };

  const handleOpenReview = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName });
    setIsReviewModalOpen(true);
  };

  const buyAgain = async (order: CheckOutData) => {
    const cartItems = order.items;
    const subtotal = cartItems.reduce((sum, item) => sum + item.subTotal, 0);
    navigate("/checkout", { state: { cartItems, subtotal } });
  };

  const handleOrderCancel = (
    id: string,
    paymentStatus: string,
    paymentMethod: string,
    status: string
  ) => {
    if (
      paymentStatus === "paid" &&
      paymentMethod === "ssl" &&
      status === "pending"
    ) {
      setSelectedOrderId(id);
      setIsRefundModalOpen(true);
    } else if (
      paymentStatus === "unpaid" &&
      paymentMethod === "cash" &&
      status === "pending"
    ) {
      setSelectedOrderId(id);
      setSelectedOrderStatus("cancelled");
      setIsCancelOrderModalOpen(true);
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton key={idx} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-1">My Orders</h2>
      <p className="text-muted-foreground mb-4">
        Track and manage all your purchases
      </p>

      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between mb-4">
        <Input
          type="text"
          placeholder="Search by order ID or product name..."
          className="w-full md:max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* You can implement actual filter UI in future */}
        <Button variant="outline" className="w-full md:w-auto">
          <span>Filter</span>
        </Button>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-6">
        {statusTabs.map((status) => (
          <Button
            key={status}
            variant={status === statusFilter ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
            className="rounded-full px-4 py-1 text-sm"
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order: OrderRequestPayload) => {
          const totalItems = order.items.reduce(
            (sum: number, item: OrderItem) => sum + item.quantity,
            0
          );
          const items = order.items;

          return (
            <Card key={order._id} className="border shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-2 items-center">
                    <span className="font-medium text-sm">
                      #{order._id.slice(-6)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize text-xs",
                        order.status === "cancelled"
                          ? "text-red-700 border-red-400 bg-red-100"
                          : "text-green-700 border-green-400 bg-green-100"
                      )}
                    >
                      {order.status}
                    </Badge>

                      <Badge
                      variant="outline"
                      className={cn(
                        "capitalize text-xs",
                        order.status === "cancelled"
                          ? "text-red-700 border-red-400 bg-red-100"
                          : "text-green-700 border-green-400 bg-green-100"
                      )}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    ৳{Math.round(order.totalPrice)}{" "}
                    <span className="text-xs">
                      ({totalItems} item{totalItems > 1 ? "s" : ""})
                    </span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  Ordered on {format(new Date(order.createdAt), "PPP")}
                </div>

                <div className="flex flex-col gap-3">
                  {items.map((item: OrderItem) => (
                    <div className="flex items-center gap-3 border p-3 rounded-md bg-muted/50">
                      <img
                        src={item?.image || "/placeholder.svg"}
                        alt={item?.productName}
                        className="w-12 h-12 rounded object-cover border"
                      />
                      <div>
                        <div className="text-sm font-medium">
                          {item?.productName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Qty: {item?.quantity}
                        </div>
                      </div>

                      <div className="ml-auto">
                        {order.status === "delivered" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleOpenReview(item.productId, item.productName)
                            }
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(order)}
                  >
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm">
                    Invoice
                  </Button>
                  <Button
                    onClick={() => buyAgain(order)}
                    variant="ghost"
                    size="sm"
                  >
                    Buy Again
                  </Button>
                  {order.status === "pending" && (
                    <Button
                      onClick={() =>
                        handleOrderCancel(
                          order._id,
                          order.paymentStatus,
                          order.paymentMethod,
                          order.status
                        )
                      }
                      variant="outline"
                      size="sm"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredOrders.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-10">
            No orders found
          </div>
        )}
      </div>
      <ViewDetails
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={openOrder}
      />

      {isRefundModalOpen && selectedOrderId && (
        <RefundModal
          open={isRefundModalOpen}
          onClose={() => {
            setIsRefundModalOpen(false);
            setSelectedOrderId(null);
          }}
          orderId={selectedOrderId}
        />
      )}

      {isCancelModalOpen && selectedOrderId && selectedOrderStatus && (
        <CancelOrderModal
          open={isCancelModalOpen}
          onClose={() => setIsCancelOrderModalOpen(false)}
          orderId={selectedOrderId}
          status={selectedOrderStatus}
        />
      )}

      {/* Add Review Modal */}
      {selectedProduct && (
        <ReviewModal
          open={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}
    </div>
  );
};

export default MyOrders;
