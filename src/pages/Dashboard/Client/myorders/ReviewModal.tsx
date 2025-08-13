import { useState } from "react";
import { usePostReviewMutation } from "../../../../redux/features/product/productApi";
import { useAppSelector } from "../../../../redux/hooks";
import type { IReview } from "../../../../redux/features/product/product.types";
import { Star } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import toast from "react-hot-toast";



interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

const ReviewModal = ({
  open,
  onClose,
  productId,
  productName,
}: ReviewModalProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [postReview, { isLoading }] = usePostReviewMutation();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = async () => {
    if (!rating || !reviewText.trim() || !user) return;
    
    const review: Omit<IReview, "date"> = {
      userId: user?._id,
      stars: rating,
      text: reviewText.trim(),
    };
    
    try {
      await postReview({ productId, review }).unwrap();
      toast.success("Review submitted successfully");
      onClose();
      // Reset form
      setRating(0);
      setReviewText("");

    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("Failed to submit review")
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">
          Review {productName}
        </h3>
        
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={24}
              className={`cursor-pointer ${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(i + 1)}
            />
          ))}
        </div>
        
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience..."
          className="w-full p-3 border rounded mb-4 min-h-[120px]"
        />
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !rating || !reviewText.trim()}
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;