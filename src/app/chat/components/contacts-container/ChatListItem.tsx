import Image from "next/image";

type Props = {
  chat: {
    id: string;
    name: string;
    type: string;
    other_user_id: string;
    other_user_image: string;
    other_user_name: string;
  };
};

export default function ChatListItem({ chat }: Props) {
  const displayName = chat.type === 'private' ? chat.other_user_name : chat.name;
  const avatar = chat.type === 'private' ? chat.other_user_image : '/group.png';

  return (
    <div className="flex items-center gap-3 px-4 py-2 hover:bg-[#2a2b33] cursor-pointer transition-all rounded-lg">
      <Image
        src={avatar || '/default-avatar.png'}
        alt={displayName}
        width={36}
        height={36}
        className="rounded-full object-cover"
      />
      <p className="text-sm font-medium text-white truncate">{displayName}</p>
    </div>
  );
}
