import {
    Notification,
    ServerOriginatedMessage,
    NotificationRequest,
    NotificationType
  } from "./fig";
  
import { sendMessage } from "./core"

export type NotificationHandler = (notification: Notification) => boolean | undefined;
export interface Subscription {
  unsubscribe() : void
}

const handlers: Partial<Record<NotificationType, NotificationHandler[]>> = {};

export const _unsubscribe = (type: NotificationType, handler?: NotificationHandler) => {
  if (handler && handlers[type] !== undefined) {
    handlers[type] = (handlers[type] ?? []).filter(x => x !== handler);
  }
}

export const _subscribe = (request: NotificationRequest, handler: NotificationHandler): Subscription | undefined =>  {

  const type = request.type

  if (!type) {
    console.warn("NotificationRequest type must be defined.")
    return
  }

  // primary subscription already exists
  if (handlers[type] !== undefined) {
    handlers[type] = [...(handlers[type] ?? []), handler]
    return  { unsubscribe: () => { _unsubscribe(type, handler) } }
  }

  handlers[type] = [];

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

  return { unsubscribe: () => { _unsubscribe(type, handler) } }
    
}

const unsubscribeFromAll = () => {
  sendMessage({ $case: "notificationRequest", notificationRequest: {
    subscribe: false,
    type: NotificationType.ALL
  }})
}

console.log("[fig] unsubscribing any existing notifications...")
unsubscribeFromAll()
