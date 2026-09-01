import {useId} from 'react';

interface Props {
  isOn: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  'aria-label'?: string;
}

const Toggle = ({isOn, onChange, 'aria-label': ariaLabel}: Props) => {
  const id = useId();
  return (
    <label htmlFor={id} className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={isOn}
        id={id}
        className="peer sr-only"
        onChange={onChange}
        aria-label={ariaLabel}
      />
      <div className="peer h-5 w-9 rounded-full bg-active after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-accent peer-checked:after:translate-x-full peer-focus-visible:ring-2 peer-focus-visible:ring-accent" />
    </label>
  );
};

export default Toggle;
