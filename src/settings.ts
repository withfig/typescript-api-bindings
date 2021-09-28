import { SettingsChangedNotification, NotificationType, GetSettingsPropertyResponse, UpdateSettingsPropertyRequest } from "./fig";
import { _subscribe } from "./notifications";

import { GetSettingsPropertyRequest } from "./fig";
import { sendMessage } from "./core";

const subscribe = (handler: (notification: SettingsChangedNotification) => boolean | undefined) => {
    _subscribe({ type: NotificationType.NOTIFY_ON_SETTINGS_CHANGE }, (notification) => {
        switch (notification?.type?.$case) {
            case "settingsChangedNotification":
                return handler(notification.type.settingsChangedNotification)
            default:
                break;
        }

        return false
    })
}

  const sendGetSettingsPropertyRequest = async (
    request: GetSettingsPropertyRequest
  ): Promise<GetSettingsPropertyResponse> =>
    new Promise((resolve, reject) => {
      const requestName = "getSettingsPropertyRequest";
      sendMessage(
        { $case: requestName, getSettingsPropertyRequest: request },
        (response) => {
          switch (response?.$case) {
            case "getSettingsPropertyResponse":
              resolve(response.getSettingsPropertyResponse);
              break;
            case "error":
              reject(Error(response.error));
              break;
            default:
              reject(
                Error(
                  `Invalid response '${response?.$case}' for '${requestName}'`
                )
              );
          }
        }
      );
    });

const get = async (
  key: string,
): Promise<GetSettingsPropertyResponse> =>
  sendGetSettingsPropertyRequest({
    key: key,
  });


  const sendUpdateSettingsPropertyRequest = async (
    request: UpdateSettingsPropertyRequest
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      const requestName = "getSettingsPropertyRequest";
      sendMessage(
        { $case: requestName, getSettingsPropertyRequest: request },
        (response) => {
          switch (response?.$case) {
            case "success":
              resolve();
              break;
            case "error":
              reject(Error(response.error));
              break;
            default:
              reject(
                Error(
                  `Invalid response '${response?.$case}' for '${requestName}'`
                )
              );
          }
        }
      );
    });

const set = async (
  key: string,
  value: any
): Promise<void> =>
    sendUpdateSettingsPropertyRequest({
    key: key,
    value: JSON.stringify(value)
  });

  const remove = async (
    key: string,
  ): Promise<void> =>
      sendUpdateSettingsPropertyRequest({
      key: key,
    });

const didChange = { subscribe }
const Settings = { didChange, get, set, remove };

export default Settings;
