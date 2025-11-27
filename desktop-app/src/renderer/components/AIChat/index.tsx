import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AIChatButton from './AIChatButton';
import AIChatWindow from './AIChatWindow';
import {
  selectIsChatOpen,
  toggleChat,
  setApiKey,
} from '../../store/features/aiChat';

const AIChat: React.FC = () => {
  const isChatOpen = useSelector(selectIsChatOpen);
  const dispatch = useDispatch();

  useEffect(() => {
    const apiKey = window.electron.store.get('geminiApiKey');
    if (apiKey) {
      dispatch(setApiKey(apiKey));
    }
  }, [dispatch]);

  const handleToggleChat = () => {
    dispatch(toggleChat());
  };

  return (
    <>
      <AIChatButton onClick={handleToggleChat} />
      {isChatOpen && <AIChatWindow onClose={handleToggleChat} />}
    </>
  );
};

export default AIChat;
