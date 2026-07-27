import {useId} from 'react';
import cx from 'classnames';

interface Props {
  label: string;
  error?: string | null;
}

const Input = ({
  label,
  error,
  ...props
}: Props &
  React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
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
        className={cx(
          'rounded-md border bg-input p-1 px-1 text-fg focus:outline-none focus-visible:ring-1 focus-visible:ring-accent',
          error != null ? 'border-red-500' : 'border-line'
        )}
        aria-invalid={error != null || undefined}
        {...props}
      />
      {error != null && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
