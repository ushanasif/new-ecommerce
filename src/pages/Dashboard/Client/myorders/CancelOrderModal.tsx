import * as React from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { useCancelOrderMutation } from "../../../../redux/features/order/orderApi";

interface CancelOrderModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  status: string;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  open,
  onClose,
  orderId,
  status,
}) => {
  const [cancelOrder, { isLoading }] = useCancelOrderMutation();

  const handleCancel = async () => {
    console.log(orderId, status);
    try {
      await cancelOrder({ orderId, status }).unwrap();
      toast.success(`Order #${orderId.slice(-6)} has been cancelled.`);
      onClose();
    } catch (error: any) {
      toast.error("Failed to cancel order");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel order #{orderId.slice(-6)}?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Close
          </Button>

          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelOrderModal;
