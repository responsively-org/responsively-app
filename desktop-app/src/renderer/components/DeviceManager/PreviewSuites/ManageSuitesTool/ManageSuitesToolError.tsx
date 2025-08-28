import Button from 'renderer/components/Button';

export const ManageSuitesToolError = ({ onClose }: { onClose: () => void }) => {
  return (
    <div
      data-testid="manage-suites-error"
      className="absolute top-0 left-0 flex h-full w-full flex-col flex-wrap items-center justify-center bg-slate-600 bg-opacity-95"
    >
      <div className="text-center text-sm text-white">
        <p>There has been an error, please try again.</p>
      </div>
      <Button onClick={onClose} className="p-2">
        Close
      </Button>
    </div>
  );
};
