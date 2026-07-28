import {useSelector} from 'react-redux';
import {selectPageTitle} from 'renderer/store/features/renderer';

// Room for the native macOS traffic lights, which are drawn over the page.
const TRAFFIC_LIGHTS_WIDTH = 78;

/**
 * The app's custom 38px title bar (design: Hybrid Studio), macOS only — the
 * window is frameless there, so this bar is also the drag handle and any
 * interactive child must opt out with `.app-no-drag`.
 *
 * Windows/Linux keep the native frame so their application menu stays in its
 * own bar below the title bar, as on any other native app.
 */
const TitleBar = () => {
  const pageTitle = useSelector(selectPageTitle);

  // Windows and Linux keep their native frame (and their native menu bar
  // below it), so the window already has a title bar there.
  if (window.responsively.platform !== 'darwin') {
    return null;
  }

  return (
    <div
      data-testid="title-bar"
      style={{paddingLeft: TRAFFIC_LIGHTS_WIDTH}}
      className="app-drag relative flex h-[38px] flex-shrink-0 select-none items-center bg-titlebar"
    >
      <span className="pointer-events-none absolute inset-x-0 truncate px-[150px] text-center text-[13px] font-semibold text-titlebar-fg">
        {pageTitle === '' ? 'Responsively' : `Responsively — ${pageTitle}`}
      </span>
    </div>
  );
};

export default TitleBar;
