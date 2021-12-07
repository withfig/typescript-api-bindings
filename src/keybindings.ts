import { KeybindingPressedNotification, NotificationType } from './fig';
import { _subscribe } from './notifications';

/**
 * Subscribe to keyboard key pressed notifications
 * @remarks 
 * This is emitted each time a user presses a key on the keyboard
 * @param handler
 * @returns 
 */
export const pressed = (
  handler: (notification: KeybindingPressedNotification) => boolean | undefined
) => {
  return _subscribe(
    { type: NotificationType.NOTIFY_ON_KEYBINDING_PRESSED },
    (notification) => {
      switch (notification?.type?.$case) {
        case 'keybindingPressedNotification':
          return handler(notification.type.keybindingPressedNotification);
        default:
          break;
      }

      return false;
    }
  );
};
