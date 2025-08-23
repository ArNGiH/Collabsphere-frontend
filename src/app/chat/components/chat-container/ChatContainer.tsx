
'use client';
import ChatHeader from './ChatHeader';
import MessageBar from './MessageBar';
import MessageContainer from './MessageContainer';

export default function ChatContainer() {
  return (
    <>
      <ChatHeader />
      <div className="flex-1 flex flex-col">
        <MessageContainer />
        <MessageBar />
      </div>
    </>
  );
}
