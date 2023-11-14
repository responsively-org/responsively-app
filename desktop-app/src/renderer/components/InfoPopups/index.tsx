import { useEffect, useState } from 'react';
import { isReleaseNotesUnseen, ReleaseNotes } from '../ReleaseNotes';
import { Sponsorship } from '../Sponsorship';

export const InfoPopups = () => {
  const [showReleaseNotes, setShowReleaseNotes] = useState<boolean>(false);
  const [showSponsorship, setShowSponsorship] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (await isReleaseNotesUnseen()) {
        setShowReleaseNotes(true);
        return;
      }
      setShowSponsorship(true);
    })();
  }, []);

  if (showReleaseNotes) {
    return <ReleaseNotes />;
  }

  if (showSponsorship) {
    return <Sponsorship />;
  }

  return null;
};
