interface Props {
  text: string;
}

const ShortcutName = ({text}: Props) => {
  const formattedText = text.replaceAll('_', ' ').toLowerCase();
  return <div className="capitalize">{formattedText}</div>;
};

export default ShortcutName;
