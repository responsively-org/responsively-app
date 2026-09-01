import {useId} from 'react';

interface Props {
  label: string;
}

const Select = ({
  label,
  ...props
}: Props &
  React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>) => {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className="rounded-md border border-line bg-input p-1 px-1 text-fg focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        {...props}
      >
        {props.children}
      </select>
    </div>
  );
};

export default Select;
