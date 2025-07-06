'use client';
import Lottie from 'lottie-react';
import animationData from '../../../../../public/assets/lottie/empty-lottie-animation.json'
export default function EmptyChatContainer() {
  return (
    <div className="flex-1 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] hidden md:flex flex-col items-center justify-center bg-[#1c1d25] text-white transition-all duration-300">
      <div className="w-[220px] h-[220px] mb-6">
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <h2 className="text-xl font-semibold mb-2">No Chat Selected</h2>
      <p className="text-sm text-gray-400 text-center px-4">
        Select a conversation from the left panel <br /> to start messaging.
      </p>
    </div>
  );
}
