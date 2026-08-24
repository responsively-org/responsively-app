const NotificationsBubble = () => {
  return (
    <span className="absolute right-0 top-0 flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  );
};

export default NotificationsBubble;
