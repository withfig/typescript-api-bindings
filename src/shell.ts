import { InsertTextRequest, NotificationType,ProcessChangedNotification, ShellPromptReturnedNotification } from "./fig";
import { _subscribe } from "./notifications";

import { sendMessage } from "./core";

const subscribeToProcessChangedNotifications = (handler: (notification: ProcessChangedNotification) => boolean | undefined) => {
    return _subscribe({ type: NotificationType.NOTIFY_ON_PROCESS_CHANGED }, (notification) => {
        switch (notification?.type?.$case) {
            case "processChangeNotification":
                return handler(notification.type.processChangeNotification)
            default:
                break;
        }

        return false
    })
}

const subscribeToPromptReturnedNotifications = (handler: (notification: ShellPromptReturnedNotification) => boolean | undefined) => {
    return _subscribe({ type: NotificationType.NOTIFY_ON_PROMPT }, (notification) => {
        switch (notification?.type?.$case) {
            case "shellPromptReturnedNotification":
                return handler(notification.type.shellPromptReturnedNotification)
            default:
                break;
        }

        return false
    })
}

export const sendInsertTextRequest = async (
    request: InsertTextRequest
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      const requestName = "insertTextRequest";
      sendMessage(
        { $case: "insertTextRequest", insertTextRequest: request },
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

const insert =  async (text: string): Promise<void> =>
    sendInsertTextRequest({
        type: { $case: "text", text: text}
    });

const promptDidReturn = { subscribe: subscribeToPromptReturnedNotifications}
const processDidChange = { subscribe: subscribeToProcessChangedNotifications };

const Shell = { processDidChange, promptDidReturn, insert };

export default Shell;
