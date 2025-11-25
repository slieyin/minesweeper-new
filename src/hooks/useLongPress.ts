import { useCallback, useRef, useState } from 'react';

interface LongPressOptions {
  shouldPreventDefault?: boolean;
  delay?: number;
  onContext?: (e: React.MouseEvent) => void;
}

const isTouchEvent = (e: React.SyntheticEvent | Event): e is React.TouchEvent => {
  return 'touches' in e;
};

const preventDefault = (e: Event) => {
  if (!isTouchEvent(e)) return;
  if (e.touches.length < 2 && e.preventDefault) {
    e.preventDefault();
  }
};

export const useLongPress = (
  onLongPress: (e: React.SyntheticEvent) => void,
  onClick: (e: React.SyntheticEvent) => void,
  { shouldPreventDefault = true, delay = 400, onContext }: LongPressOptions = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<number | undefined>(undefined);
  const target = useRef<EventTarget | null>(null);
  
  // Ref to track if a long press effectively happened during this interaction session
  // This is used to block the context menu from firing immediately after a long press
  const isLongPressActive = useRef(false);

  const start = useCallback(
    (event: React.SyntheticEvent) => {
      // Ignore right clicks for the start of a long press (let them pass to context menu naturally)
      if (event.nativeEvent instanceof MouseEvent && event.nativeEvent.button !== 0) {
          return;
      }

      if (shouldPreventDefault && event.target) {
        event.target.addEventListener('touchend', preventDefault, { passive: false });
        target.current = event.target;
      }
      
      setLongPressTriggered(false);
      isLongPressActive.current = false;
      
      timeout.current = window.setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
        isLongPressActive.current = true;
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: React.SyntheticEvent, shouldTriggerClick = true) => {
      if (timeout.current !== undefined) {
        window.clearTimeout(timeout.current);
        timeout.current = undefined;
      }
      
      // If it wasn't a long press, trigger the click
      if (shouldTriggerClick && !longPressTriggered && !isLongPressActive.current) {
        onClick(event);
      }
      
      setLongPressTriggered(false);
      // Note: We do NOT reset isLongPressActive.current here yet, because the 
      // contextmenu event usually fires AFTER touchend/mouseup.
      
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
      // If a long press just happened, prevent the context menu (it's a double fire)
      if (isLongPressActive.current) {
          e.preventDefault();
          // Reset the lock now that we've consumed the context menu event
          isLongPressActive.current = false;
          return;
      }
      
      // Otherwise, it's a legitimate right click (desktop)
      e.preventDefault(); // Always prevent system menu in this game
      if (onContext) {
          onContext(e);
      }
  }, [onContext]);

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
    onContextMenu: handleContextMenu
  };
};