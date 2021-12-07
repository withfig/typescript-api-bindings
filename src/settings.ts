import { SettingsChangedNotification, NotificationType } from './fig';
import { _subscribe } from './notifications';

import {
  sendGetSettingsPropertyRequest,
  sendUpdateSettingsPropertyRequest,
} from './requests';

/**
 * Subscribe to notifications emitted when a property from settings changed
 */
export const didChange = {
  subscribe: (
    handler: (notification: SettingsChangedNotification) => boolean | undefined
  ) => {
    _subscribe(
      { type: NotificationType.NOTIFY_ON_SETTINGS_CHANGE },
      (notification) => {
        switch (notification?.type?.$case) {
          case 'settingsChangedNotification':
            return handler(notification.type.settingsChangedNotification);
          default:
            break;
        }

        return false;
      }
    );
  },
};

/**
 * Get the value of a property from settings
 * @param key the key of the property to read
 * @returns a Promise resolving the value of the the requested setting property
 */
export const get = async (key: string) =>
  sendGetSettingsPropertyRequest({
    key: key,
  });

/**
 * Set the value of a property from settings
 * @param key the key of the property to update
 * @param value the value to set
 * @returns {Promise}
 */
export const set = async (key: string, value: any): Promise<void> =>
  sendUpdateSettingsPropertyRequest({
    key: key,
    value: JSON.stringify(value),
  });

/**
 * Remove a property from settings
 * @param key the key of the property to remove
 * @returns {Promise}
 */
export const remove = async (key: string): Promise<void> =>
  sendUpdateSettingsPropertyRequest({
    key: key,
  });
