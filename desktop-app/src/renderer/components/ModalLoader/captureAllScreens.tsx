/* eslint-disable jsx-a11y/label-has-associated-control */
import { FormEvent, useEffect, useState } from 'react';
import Button from '../Button';
import Input from '../Input';
import Modal from '../Modal';

interface FormData {
  captureEachImage: boolean;
  mergeImages: boolean;
  prefix: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  formData: (data: FormData) => void;
  title: JSX.Element | string;
}

const CaptureAllScreens = ({ isOpen, onClose, title, formData }: Props) => {
  const [captureEachImage, setCaptureEachImage] = useState(false);
  const [mergeImages, setMergeImage] = useState(false);
  const [prefix, setPrefix] = useState<string>('');
  const [isFormValid, setFormValidity] = useState(false);

  const captureImages = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formData({ captureEachImage, mergeImages, prefix });
  };

  const validateInput = () => {
    if (captureEachImage || mergeImages) {
      if (mergeImages && prefix && prefix.trim() !== '') {
        setFormValidity(true);
      } else if (captureEachImage && !mergeImages) {
        setFormValidity(true);
      } else {
        setFormValidity(false);
      }
    } else {
      setFormValidity(false);
    }
  };

  useEffect(() => {
    validateInput();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergeImages, captureEachImage, prefix]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>
        <div className="h-px w-full bg-black" />
        <form onSubmit={(e) => captureImages(e)}>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="pt-5 pr-5 pb-5">
                <Input
                  type="checkbox"
                  label="Save each image seperately"
                  id="save-separatly"
                  name="Save each Image seperately"
                  value="save_seperately"
                  onChange={(e) => setCaptureEachImage(e.target.checked)}
                />
              </div>
              <div className="pl-5 pt-5 pb-5">
                <Input
                  label="Merge images"
                  type="checkbox"
                  id="merge-images"
                  name="Merge Images"
                  onChange={(e) => setMergeImage(e.target.checked)}
                />
              </div>
            </div>
            <div>
              <Input
                label="Prefix for merged Image"
                type="text"
                disabled={!mergeImages}
                placeholder="Enter prefix..."
                onChange={(e) => setPrefix(e.target.value)}
              />
              <p className="text-sm">Prefix needed for merging images</p>
            </div>
            <div className="flex justify-end pt-5">
              <Button
                type="submit"
                className="bg-blue-500 px-2 text-white hover:bg-blue-700 disabled:bg-gray-500 dark:hover:bg-blue-600"
                onClick={() => {}}
                disabled={!isFormValid}
              >
                Capture
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CaptureAllScreens;
