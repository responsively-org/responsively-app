import Modal from '../Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: JSX.Element | string;
}

const ModalLoader = ({ isOpen, onClose, title }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center justify-center gap-4">
        Capturing screen...
      </div>
    </Modal>
  );
};

export default ModalLoader;
