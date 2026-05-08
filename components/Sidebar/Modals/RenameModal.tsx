import Modal from "@/components/Modal";
import type { Conversation } from "@/types/Chat";
import { useRenameModal } from "@/hooks/useRenameModal";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatRoom: Conversation | null;
}

const RenameModal = ({
  isOpen,
  onClose,
  chatRoom,
}: RenameModalProps) => {
  const {
    name,
    error,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    handleModalClose,
  } = useRenameModal({ isOpen, chatRoom, onClose });

  if (!isOpen || !chatRoom) return null;

  const buttonText = isSubmitting ? "Renaming..." : "Rename";

  return (
    <Modal onClose={handleModalClose}>
      <div className="p-4 relative">
        <h2 className="text-xl font-semibold mb-5">Rename Chat</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <input
              type="text"
              id="chatName"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 text-base ${
                error ? "border-red-500" : "border-border"
              }`}
              value={name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter chat name"
            />
            <div className="h-5 mt-2">
              {error && (
                <p className="text-red-500 text-sm animate-fadeIn">{error}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-5 py-2.5 text-base bg-black text-white rounded-lg hover:bg-card disabled:bg-muted disabled:cursor-not-allowed transition-all duration-200 min-w-[100px] flex items-center justify-center font-medium"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting && (
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              )}
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RenameModal;
