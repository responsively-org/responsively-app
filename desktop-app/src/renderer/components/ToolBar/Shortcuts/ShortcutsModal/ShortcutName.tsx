interface Props {
  text: string;
}

function ShortcutName({ text }: Props) {
  const formattedText = text.replace('_', ' ').toLowerCase();
  return <div className="capitalize">{formattedText}</div>;
}

export default ShortcutName;
