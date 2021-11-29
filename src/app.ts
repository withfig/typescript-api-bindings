import { sendUpdateApplicationPropertiesRequest } from './requests';
import { Action } from './fig';
export const registerActions = (actions: Array<Action>) =>
  sendUpdateApplicationPropertiesRequest({ actions: actions });
