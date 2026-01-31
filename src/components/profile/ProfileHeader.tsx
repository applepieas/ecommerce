import Image from "next/image";

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-12">
      <div className="relative h-24 w-24 overflow-hidden rounded-full border border-gray-200 bg-gray-100 md:h-32 md:w-32">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-gray-400">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold font-heading-2 md:text-3xl text-dark-900">{user.name}</h1>
        <p className="mt-1 text-gray-500 font-body">{user.email}</p>
      </div>
    </div>
  );
}
