import { useCallback, useRef, useState } from 'react';

interface LongPressOptions {
  shouldPreventDefault?: boolean;
  delay?: number;
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
  { shouldPreventDefault = true, delay = 400 }: LongPressOptions = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  // Use 'number' for browser setTimeout compatibility (no NodeJS.Timeout)
  const timeout = useRef<number | undefined>(undefined);
  const target = useRef<EventTarget | null>(null);

  const start = useCallback(
    (event: React.SyntheticEvent) => {
      if (shouldPreventDefault && event.target) {
        event.target.addEventListener('touchend', preventDefault, { passive: false });
        target.current = event.target;
      }
      
      setLongPressTriggered(false);
      
      timeout.current = window.setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
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
      
      if (shouldTriggerClick && !longPressTriggered) {
        onClick(event);
      }
      
      setLongPressTriggered(false);
      
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
    onContextMenu: (e: React.MouseEvent) => {
        // Prevent native context menu to allow right-click flagging
        e.preventDefault();
    }
  };
};