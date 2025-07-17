import { Icon } from '@iconify/react';

interface Props {
  spinnerHeight?: number;
}

function Spinner({ spinnerHeight = undefined }: Props) {
  return (
    <span className="animate-spin">
      <Icon icon="ei:spinner-3" height={spinnerHeight} />
    </span>
  );
}

export default Spinner;
