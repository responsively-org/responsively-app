import { useEffect, useState } from 'react';
import { isReleaseNotesUnseen, ReleaseNotes } from '../ReleaseNotes';
import { Sponsorship } from '../Sponsorship';
import { ChromePopup } from '../ChromePopup';

export const InfoPopups = () => {
  const [showReleaseNotes, setShowReleaseNotes] = useState<boolean>(false);
  const [showSponsorship, setShowSponsorship] = useState<boolean>(false);
  const [showChromePopup, setShowChromePopup] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (await isReleaseNotesUnseen()) {
        setShowReleaseNotes(true);
        return;
      }
      setShowSponsorship(true);
      setShowChromePopup(true);
    })();
  }, []);

  if (showReleaseNotes) {
    return <ReleaseNotes />;
  }

  if (showSponsorship) {
    return <Sponsorship />;
  }
  if (showChromePopup) {
    return <ChromePopup />;
  }

  return null;
};
