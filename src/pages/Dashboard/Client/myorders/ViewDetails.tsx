import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import type { OrderRequestPayload } from "../../../../redux/features/order/orderType";

interface Props {
  open: boolean;
  onClose: () => void;
  order: OrderRequestPayload | null;
}

const ViewDetails = ({ open, onClose, order }: Props) => {
  console.log({order});
  if (!order) return null;
  const shippingCost = order.deliveryFee;
  const subTotal = order.totalPrice - order.deliveryFee;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Order Details</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-3">
          #{order._id.slice(-6)}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <Badge
            variant="outline"
            className="capitalize text-xs text-green-700 border-green-400 bg-green-100"
          >
            {order.status}
          </Badge>
          <span className="text-sm text-gray-500">
            Ordered on {format(new Date(order.createdAt), "PPP")}
          </span>
        </div>

        <div className="mb-3">
          <h4 className="text-sm font-semibold mb-2">Items</h4>
          {order.items?.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg-muted px-3 py-2 rounded mb-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.productName}
                  className="w-12 h-12 rounded object-cover border"
                />
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-gray-500">
                    Qty: {item.quantity}
                    {item.size && ` • Size: ${item.size}`}
                    {item.color && (
                      <>
                        {" "}
                        • Color:{" "}
                        <span
                          className="inline-block w-3 h-3 rounded-full border"
                          style={{ backgroundColor: item.color }}
                        ></span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="text-sm font-semibold text-right">
                ৳{Math.round(item.subTotal)}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <h4 className="font-medium mb-1">Shipping Address</h4>
            <p>
              {order.deliveryAddress.addressDetails},{" "}
              {order.deliveryAddress.city},{" "}
              {order.deliveryAddress.district}
              {order.deliveryAddress.division}
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Payment Method</h4>
            <p className="capitalize">{order.paymentMethod}</p>
            <p className="text-xs text-gray-400">Number: N/A</p>
          </div>
        </div>

        <hr className="my-2" />

        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>৳{Math.round(subTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>৳{shippingCost}</span>
          </div>
          <div className="flex justify-between font-semibold text-base mt-2">
            <span>Total</span>
            <span>৳{Math.round(order?.totalPrice)}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-primary text-white">
            <span className="mr-2">⬇</span> Download Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetails;
