import React from 'react';

type AIChatButtonProps = {
  onClick: () => void;
};

const AIChatButton: React.FC<AIChatButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-5 right-5 rounded-full bg-blue-500 py-2 px-4 font-bold text-white shadow-lg hover:bg-blue-700"
      aria-label="Open AI Chat"
    >
      AI
    </button>
  );
};

export default AIChatButton;
