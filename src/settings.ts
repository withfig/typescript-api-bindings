import { SettingsChangedNotification, NotificationType } from "./fig";
import { _subscribe } from "./notifications";

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
const Settings = { subscribe };

export default Settings;
