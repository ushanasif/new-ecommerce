import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "../../../../components/ui/card";

import { format } from "date-fns";
import { useGetRefundQuery } from "../../../../redux/features/refund/refundApi";
import { useGetOrderQuery } from "../../../../redux/features/order/orderApi";
import type { OrderRequestPayload } from "../../../../redux/features/order/orderType";
import type { IRefund } from "../../../../redux/features/refund/refundTypes";
import { useAppSelector } from "../../../../redux/hooks";

const RefundList = () => {
  const {user} = useAppSelector((state) => state.auth);
  const {data: orderRes} = useGetOrderQuery(user?._id);
  const orders = orderRes?.data || [];
  console.log(orders);
  const { data: refundRes, isLoading: isRefundLoading } =
    useGetRefundQuery(undefined);
  const refundData = refundRes?.data || [];

 const orderIdSet = new Set(orders.map((order: OrderRequestPayload) => String(order?._id)));

const filteredRefundData = refundData.filter((refund: IRefund) =>
  orderIdSet.has(String(refund.orderId?._id))
);
console.log(filteredRefundData);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {isRefundLoading ? (
        <p className="col-span-full text-center text-gray-500">Loading...</p>
      ) : filteredRefundData.length === 0 ? (
        <p className="col-span-full text-center text-gray-500">
          No refund request found
        </p>
      ) : (
        filteredRefundData.map((req: any) => (
          <Card key={req._id} className="shadow-md border rounded-2xl">
            <CardHeader>
              <CardDescription className="font-bold">
                {format(new Date(req.createdAt), "dd MMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Order ID:</strong> #{req.orderId?._id?.slice(-6)}
              </p>
              <p>
                <strong>Transaction ID:</strong> {req.orderId?.transaction_id}
              </p>
              <p>
                <strong>Refund Method:</strong> {req.refundMethod}
              </p>
              <p>
                <strong>Refund Number:</strong> {req.refundNumber}
              </p>
              <p>
                <strong>Amount:</strong> ৳{Math.round(req.orderId?.totalPrice)}
              </p>
              <p>
                <strong>Status:</strong> {req.refundStatus}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default RefundList;
