interface Props {
  text: string[];
}

const ShortcutButton = ({ text }: Props) => {
  const formattedText = text[0].split('+');
  const arrLength = formattedText.length - 1;
  const convertToSymbol = (value: string) => (value === 'mod' ? `⌘` : value);
  return (
    <div>
      {formattedText.map((value, i) => (
        <>
          <span className="rounded border border-gray-200 bg-gray-100 px-[6px] py-[2px] text-xs font-semibold text-gray-800 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-100">
            {convertToSymbol(value)}
          </span>
          {i < arrLength && <span className="px-1">+</span>}
        </>
      ))}
    </div>
  );
};

export default ShortcutButton;
