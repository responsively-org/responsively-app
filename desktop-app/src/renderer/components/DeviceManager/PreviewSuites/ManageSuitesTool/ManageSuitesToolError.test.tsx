import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ManageSuitesToolError } from './ManageSuitesToolError';

describe('ManageSuitesToolError', () => {
  it('renders the error message and close button', () => {
    const onClose = jest.fn();
    render(<ManageSuitesToolError onClose={onClose} />);

    expect(
      screen.getByText('There has been an error, please try again.')
    ).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    render(<ManageSuitesToolError onClose={onClose} />);

    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
