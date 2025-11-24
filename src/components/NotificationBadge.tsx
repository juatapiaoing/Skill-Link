interface NotificationBadgeProps {
    count: number;
}

export default function NotificationBadge({ count }: NotificationBadgeProps) {
    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
            {count > 9 ? '9+' : count}
        </span>
    );
}
