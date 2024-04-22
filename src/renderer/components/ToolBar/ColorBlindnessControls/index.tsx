import { useEffect, useState } from 'react';
import { VisionSimulationDropDown } from 'renderer/components/VisionSimulationDropDown';
import { webViewPubSub } from 'renderer/lib/pubsub';

export const COLOR_BLINDNESS_CHANNEL = 'color-blindness';

export const ColorBlindnessControls = () => {
  const [simulationName, setSimulationName] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    webViewPubSub.publish(COLOR_BLINDNESS_CHANNEL, { simulationName });
  }, [simulationName]);

  return (
    <VisionSimulationDropDown
      simulationName={simulationName}
      onChange={setSimulationName}
    />
  );
};
