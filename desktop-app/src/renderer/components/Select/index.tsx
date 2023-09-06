import { useId } from 'react';

interface Props {
  label: string;
}

const Select = ({
  label,
  ...props
}: Props &
  React.DetailedHTMLProps<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >) => {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id}>{label}</label>
      <select
        id="device-capabilities"
        className="rounded-sm bg-white p-1 px-1 dark:bg-slate-900"
        /* eslint-disable-next-line react/jsx-props-no-spreading */
        {...props}
      >
        {props.children}
      </select>
    </div>
  );
};

export default Select;
