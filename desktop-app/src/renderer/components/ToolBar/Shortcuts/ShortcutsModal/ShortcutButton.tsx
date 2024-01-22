interface Props {
  text: string[];
}

const ShortcutButton = ({ text }: Props) => {
  const btnText = text[0].split('+');
  const btnTextLength = btnText.length - 1;

  const formatText = (value: string) => {
    if (value === 'mod') {
      if (navigator?.userAgent?.includes('Windows')) {
        return `Ctrl`;
      }
      return `⌘`;
    }

    if (value.length === 1) return value.toUpperCase();
    return value;
  };
  return (
    <div>
      {btnText.map((value, i) => (
        <span key={value}>
          <span className="rounded border border-gray-200 bg-gray-100 px-[6px] py-[2px] text-xs font-semibold text-gray-800 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100">
            {formatText(value)}
          </span>
          {i < btnTextLength && <span className="px-1">+</span>}
        </span>
      ))}
    </div>
  );
};

export default ShortcutButton;
