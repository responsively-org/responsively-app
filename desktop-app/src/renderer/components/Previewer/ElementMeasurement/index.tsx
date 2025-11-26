import { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import {
  selectMeasurementEnabled,
  selectStartPoint,
  selectDeviceMeasurements,
  setStartPoint,
  addMeasurement,
  removeMeasurement,
  MeasurementPoint,
} from '../../../store/features/element-measurement';

interface Props {
  deviceId: string;
  width: number;
  height: number;
  zoomFactor: number;
}

interface MeasurementLineProps {
  start: MeasurementPoint;
  end: MeasurementPoint;
  zoomFactor: number;
  onRemove?: () => void;
  isPreview?: boolean;
}

const calculateDistance = (
  start: MeasurementPoint,
  end: MeasurementPoint
): { horizontal: number; vertical: number; diagonal: number } => {
  const horizontal = Math.abs(end.x - start.x);
  const vertical = Math.abs(end.y - start.y);
  const diagonal = Math.sqrt(horizontal ** 2 + vertical ** 2);
  return { horizontal, vertical, diagonal };
};

const MeasurementLine = ({
  start,
  end,
  zoomFactor,
  onRemove,
  isPreview = false,
}: MeasurementLineProps) => {
  const distances = calculateDistance(start, end);
  const scaledStart = { x: start.x * zoomFactor, y: start.y * zoomFactor };
  const scaledEnd = { x: end.x * zoomFactor, y: end.y * zoomFactor };

  const midX = (scaledStart.x + scaledEnd.x) / 2;
  const midY = (scaledStart.y + scaledEnd.y) / 2;

  const showHorizontal = distances.horizontal > 5;
  const showVertical = distances.vertical > 5;

  return (
    <g className={isPreview ? 'opacity-70' : ''}>
      {/* Main diagonal line */}
      <line
        x1={scaledStart.x}
        y1={scaledStart.y}
        x2={scaledEnd.x}
        y2={scaledEnd.y}
        stroke="#ff4444"
        strokeWidth="2"
        strokeDasharray={isPreview ? '5,5' : 'none'}
      />

      {/* Horizontal guide line */}
      {showHorizontal && showVertical && (
        <line
          x1={scaledStart.x}
          y1={scaledStart.y}
          x2={scaledEnd.x}
          y2={scaledStart.y}
          stroke="#4488ff"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.7"
        />
      )}

      {/* Vertical guide line */}
      {showHorizontal && showVertical && (
        <line
          x1={scaledEnd.x}
          y1={scaledStart.y}
          x2={scaledEnd.x}
          y2={scaledEnd.y}
          stroke="#44ff88"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.7"
        />
      )}

      {/* Start point */}
      <circle
        cx={scaledStart.x}
        cy={scaledStart.y}
        r="4"
        fill="#ff4444"
        stroke="white"
        strokeWidth="1"
      />

      {/* End point */}
      <circle
        cx={scaledEnd.x}
        cy={scaledEnd.y}
        r="4"
        fill="#ff4444"
        stroke="white"
        strokeWidth="1"
      />

      {/* Distance label background */}
      <rect
        x={midX - 45}
        y={midY - 28}
        width="90"
        height={showHorizontal && showVertical ? 52 : 24}
        rx="4"
        fill="rgba(0, 0, 0, 0.85)"
      />

      {/* Distance labels */}
      <text
        x={midX}
        y={midY - 12}
        textAnchor="middle"
        fill="white"
        fontSize="11"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {Math.round(distances.diagonal)}px
      </text>

      {showHorizontal && showVertical && (
        <>
          <text
            x={midX}
            y={midY + 4}
            textAnchor="middle"
            fill="#4488ff"
            fontSize="10"
            fontFamily="monospace"
          >
            W: {Math.round(distances.horizontal)}px
          </text>
          <text
            x={midX}
            y={midY + 18}
            textAnchor="middle"
            fill="#44ff88"
            fontSize="10"
            fontFamily="monospace"
          >
            H: {Math.round(distances.vertical)}px
          </text>
        </>
      )}

      {/* Remove button (only for saved measurements) */}
      {!isPreview && onRemove && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{ cursor: 'pointer' }}
        >
          <circle cx={midX + 38} cy={midY - 20} r="8" fill="#ff4444" />
          <text
            x={midX + 38}
            y={midY - 16}
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
};

const ElementMeasurement = ({ deviceId, width, height, zoomFactor }: Props) => {
  const dispatch = useDispatch();
  const isEnabled = useSelector(selectMeasurementEnabled);
  const startPoint = useSelector(selectStartPoint);
  const measurements = useSelector(selectDeviceMeasurements(deviceId));

  const [mousePosition, setMousePosition] = useState<MeasurementPoint | null>(
    null
  );
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isEnabled || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoomFactor;
      const y = (e.clientY - rect.top) / zoomFactor;

      setMousePosition({ x, y });
    },
    [isEnabled, zoomFactor]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isEnabled || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoomFactor;
      const y = (e.clientY - rect.top) / zoomFactor;

      if (!startPoint) {
        // Set start point
        dispatch(setStartPoint({ point: { x, y }, deviceId }));
      } else {
        // Create measurement
        dispatch(
          addMeasurement({
            id: uuidv4(),
            startPoint,
            endPoint: { x, y },
            deviceId,
          })
        );
      }
    },
    [isEnabled, startPoint, deviceId, zoomFactor, dispatch]
  );

  const handleRemoveMeasurement = useCallback(
    (id: string) => {
      dispatch(removeMeasurement(id));
    },
    [dispatch]
  );

  // Reset mouse position when disabled
  useEffect(() => {
    if (!isEnabled) {
      setMousePosition(null);
    }
  }, [isEnabled]);

  const scaledWidth = width * zoomFactor;
  const scaledHeight = height * zoomFactor;

  return (
    <svg
      ref={svgRef}
      width={scaledWidth}
      height={scaledHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: isEnabled ? 'auto' : 'none',
        cursor: isEnabled ? 'crosshair' : 'default',
        zIndex: isEnabled ? 100 : 10,
      }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePosition(null)}
    >
      {/* Saved measurements */}
      {measurements.map((measurement) => (
        <MeasurementLine
          key={measurement.id}
          start={measurement.startPoint}
          end={measurement.endPoint}
          zoomFactor={zoomFactor}
          onRemove={() => handleRemoveMeasurement(measurement.id)}
        />
      ))}

      {/* Preview line (from start point to current mouse position) */}
      {isEnabled && startPoint && mousePosition && (
        <MeasurementLine
          start={startPoint}
          end={mousePosition}
          zoomFactor={zoomFactor}
          isPreview
        />
      )}

      {/* Start point indicator when waiting for end point */}
      {isEnabled && startPoint && (
        <circle
          cx={startPoint.x * zoomFactor}
          cy={startPoint.y * zoomFactor}
          r="6"
          fill="none"
          stroke="#ff4444"
          strokeWidth="2"
          strokeDasharray="3,3"
        >
          <animate
            attributeName="r"
            values="6;10;6"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );
};

export default ElementMeasurement;
