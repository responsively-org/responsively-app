import { useMemo, useState } from 'react';
import type { VisualDiffResultPayload } from 'common/visualDiff';
import Modal from '../Modal';
import Button from '../Button';
import Spinner from '../Spinner';

interface Props {
  isOpen: boolean;
  isLoading: boolean;
  result: VisualDiffResultPayload | null;
  onClose: () => void;
}

const VIEW_TABS = [
  { id: 'overlay', label: '겹쳐보기' },
  { id: 'diff', label: '차이 강조' },
  { id: 'baseline', label: '기준' },
  { id: 'current', label: '현재' },
] as const;

type ViewTab = typeof VIEW_TABS[number]['id'];

const VisualDiffModal = ({ isOpen, isLoading, result, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('overlay');
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);

  const formattedTimestamp = useMemo(() => {
    if (!result) {
      return '';
    }
    return new Date(result.createdAt).toLocaleString();
  }, [result]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="시각적 회귀 검사"
      description="저장된 기준 스크린샷과 현재 페이지를 비교합니다."
    >
      {isLoading || !result ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner spinnerHeight={40} />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold">{result.deviceName}</span>
            <span className="truncate text-xs">{result.address}</span>
            <span className="text-xs">
              기준 저장: {formattedTimestamp} · 변화율{' '}
              <span className="font-semibold">
                {result.mismatchPercentage.toFixed(2)}%
              </span>
            </span>
          </div>

          <div className="flex gap-2">
            {VIEW_TABS.map((tab) => (
              <Button
                key={tab.id}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {activeTab === 'overlay' && (
            <div className="flex flex-col gap-2">
              <div className="relative flex max-h-[420px] justify-center overflow-hidden rounded border border-slate-200 bg-black/5 dark:border-slate-700">
                <img
                  src={result.baselineDataUrl}
                  alt="Baseline"
                  className="max-h-[420px] w-auto"
                />
                <img
                  src={result.currentDataUrl}
                  alt="Current"
                  className="absolute top-0 left-1/2 max-h-[420px] w-auto -translate-x-1/2"
                  style={{ opacity: overlayOpacity }}
                />
              </div>
              <label
                htmlFor="overlay-opacity-slider"
                className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300"
              >
                겹쳐보기 투명도 ({Math.round(overlayOpacity * 100)}%)
                <input
                  id="overlay-opacity-slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={overlayOpacity}
                  onChange={(event) =>
                    setOverlayOpacity(Number(event.target.value))
                  }
                />
              </label>
            </div>
          )}

          {activeTab === 'diff' && (
            <div className="flex justify-center rounded border border-slate-200 bg-black/80 p-2 dark:border-slate-700">
              <img
                src={result.diffDataUrl}
                alt="Diff"
                className="max-h-[420px] w-auto"
              />
            </div>
          )}

          {activeTab === 'baseline' && (
            <div className="flex justify-center rounded border border-slate-200 bg-black/5 p-2 dark:border-slate-700">
              <img
                src={result.baselineDataUrl}
                alt="Baseline only"
                className="max-h-[420px] w-auto"
              />
            </div>
          )}

          {activeTab === 'current' && (
            <div className="flex justify-center rounded border border-slate-200 bg-black/5 p-2 dark:border-slate-700">
              <img
                src={result.currentDataUrl}
                alt="Current view"
                className="max-h-[420px] w-auto"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>닫기</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default VisualDiffModal;
