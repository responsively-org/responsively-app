import { useId } from 'react';
import cx from 'classnames';

interface Props {
  label: string;
}

const Input = ({
  label,
  ...props
}: Props &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >) => {
  const id = useId();
  const isCheckbox = props.type === 'checkbox';
  return (
    <div
      className={cx('flex gap-1', {
        'flex-col': !isCheckbox,
        'flex-row-reverse justify-end': isCheckbox,
      })}
    >
      <label htmlFor={id}>{label}</label>
      <input
        type="text"
        id={id}
        className="rounded-sm bg-white p-1 px-1 dark:bg-slate-900"
        /* eslint-disable-next-line react/jsx-props-no-spreading */
        {...props}
      />
    </div>
  );
};

export default Input;
