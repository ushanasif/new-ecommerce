import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { useCreateRefundMutation } from "../../../../redux/features/refund/refundApi"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../../../components/ui/dialog"
import { Label } from "../../../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import { Input } from "../../../../components/ui/input"
import { Button } from "../../../../components/ui/button"

const refundSchema = z.object({
  refundMethod: z.enum(["bkash", "nagad", "rocket"]),
  refundNumber: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Must be a valid Bangladeshi number (e.g. 01XXXXXXXXX)"),
})

type RefundFormData = z.infer<typeof refundSchema>

interface RefundModalProps {
  open: boolean
  onClose: () => void
  orderId: string
}

const RefundModal: React.FC<RefundModalProps> = ({ open, onClose, orderId }) => {
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
  })

  const [createRefund, { isLoading }] = useCreateRefundMutation()

  const onSubmit = async (data: RefundFormData) => {
    try {
      const payload = {
        orderId,
        ...data,
      }
      await createRefund(payload).unwrap()
      toast.success("Refund request submitted!")
      reset()
      setShowSuccessModal(true)
    } catch (error: any) {
      toast.error(error?.data?.message || "Refund request failed")
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    onClose() // close the refund modal as well
  }

  return (
    <>
      {/* Refund form modal */}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel order and Submit Refund Request</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <div className="mt-5">
              <Label className="pb-2">Refund Method</Label>
              <Select
                onValueChange={(value) => setValue("refundMethod", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Card</SelectItem> 
                  <SelectItem value="bkash">BKash</SelectItem>
                  <SelectItem value="nagad">Nagad</SelectItem>
                  <SelectItem value="rocket">Rocket</SelectItem> 
                </SelectContent>
              </Select>
              {errors.refundMethod && (
                <p className="text-sm text-red-500">{errors.refundMethod.message}</p>
              )}
            </div>

            <div>
              <Label className="mb-3">Refund Number</Label>
              <Input
                {...register("refundNumber")}
                placeholder="e.g., 01XXXXXXXXX or account no."
              />
              {errors.refundNumber && (
                <p className="text-sm text-red-500">{errors.refundNumber.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Confirm"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success modal */}
      <Dialog open={showSuccessModal} onOpenChange={handleSuccessModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Request Accepted</DialogTitle>
            <DialogDescription>
              Your order has been cancelled and refund request accepted. It may take
              up to 48 hours to get the refund. Thank you.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSuccessModalClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RefundModal
