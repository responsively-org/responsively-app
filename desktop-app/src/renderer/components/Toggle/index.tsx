interface Props {
  isOn: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  id?: string;
  'data-testid'?: string;
}

const Toggle = ({isOn, onChange, id = 'small-toggle', 'data-testid': dataTestId}: Props) => {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={isOn}
        id={id}
        data-testid={dataTestId}
        className="peer sr-only"
        onChange={onChange}
      />
      <div className="peer h-5 w-9 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700" />
    </label>
  );
};

export default Toggle;
