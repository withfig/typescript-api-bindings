import {
    Notification,
    ServerOriginatedMessage,
    NotificationRequest,
    NotificationType
  } from "./fig";
  
import { sendMessage } from "./core"

export const _unsubscribe = (type: NotificationType, handler?: NotificationHandler) => {


  if (handler) {
    let notificationHandlers = handlers[type] ?? []


    let idx = notificationHandlers.indexOf(handler)
    
    if (idx > -1) {
      notificationHandlers.splice(idx, 1)
      handlers[type] = notificationHandlers
    } 

    if (notificationHandlers.length != 0) {
      return
    }
  }
 
  sendMessage({ $case: "notificationRequest", notificationRequest: {
      subscribe: false,
      type: type
    } 
  })

}
export type NotificationHandler = (notification: Notification) => boolean | undefined;
const handlers: Partial<Record<NotificationType, NotificationHandler[]>> = {};

export const _subscribe = (request: NotificationRequest, handler: NotificationHandler) => {

  const type = request.type

  if (!type) {
    console.warn("NotificationRequest type must be defined.")
    return
  }

  let handlersForType = handlers[type] ?? []

  // primary subscription already exists
  if (handlersForType.length > 0) {
    handlersForType.push(handler)
    handlers[type] = handlersForType
    return
  }

  handlers[type] = handlersForType

  request.subscribe = true

  sendMessage({ $case: "notificationRequest", notificationRequest: request },
   (response: ServerOriginatedMessage["submessage"]) => {

    switch (response?.$case) {
      case "notification":
        let notificationHandlers = handlers[type] 
        if (!notificationHandlers) {
          return false
        }

        // call handlers and remove any that have unsubscribed (by returning false)
        notificationHandlers = notificationHandlers.filter((handler) => handler(response.notification) !== false)
        handlers[type] = notificationHandlers

        if (notificationHandlers.length == 0) {
          _unsubscribe(type)
          return false
        }

        return true
      case "success":
        handlers[type]?.push(handler)
        return true
      case "error":
        console.error(response.error);
        break;
      default:
        console.warn("Not a Notification!")
        break;
    }

    return false
  })

  return { unsubscribe: () => { _unsubscribe(type, handler) }}
    
}