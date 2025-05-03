import { useState, useEffect } from "react";

export default function ReviewModal({ isOpen, onClose, onSubmit }) {
  const [review, setReview] = useState("");
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowContent(true);
    } else {
      const timeout = setTimeout(() => setShowContent(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen && !showContent) return null;

  function handleOk() {
    onSubmit(review.trim()); // trim before sending
    setReview("");
    onClose();
  }

  function handleCancel() {
    setReview("");
    onClose();
  }

  const isReviewEmpty = review.trim() === ""; // 👈 check if only spaces

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? "bg-black bg-opacity-50" : "bg-transparent"}`}>
      <div className={`bg-white rounded-lg p-6 w-96 shadow-lg transform transition-all duration-300
        ${isOpen ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-10 scale-95"}`}>
        
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Write a Review</h2>

        <input
          type="text"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Type your review..."
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleOk}
            disabled={isReviewEmpty}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
