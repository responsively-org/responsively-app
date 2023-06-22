interface Props {
  text: string;
}

const ShortcutName = ({ text }: Props) => {
  const formattedText = text.replace('_', ' ').toLowerCase();
  return <div className="capitalize">{formattedText}</div>;
};

export default ShortcutName;
