const NotificationsBubble = () => {
  return (
    <span className="absolute top-0 right-0 flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  );
};

export default NotificationsBubble;
