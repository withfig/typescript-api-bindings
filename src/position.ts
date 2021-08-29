import {
  PositionWindowRequest,
  PositionWindowResponse,
} from "./fig";

import { sendMessage } from "./core";

// This feels like it should be able to be expressed as a generic
// so we don't need to repeat ourselves for each API request
// but I haven't found a good way of doing it
export const sendWindowPositionRequest = async (
  request: PositionWindowRequest
): Promise<PositionWindowResponse> =>
  new Promise((resolve, reject) => {
    const requestName = "positionWindowRequest";
    sendMessage(
      { $case: requestName, positionWindowRequest: request },
      (response) => {
        switch (response?.$case) {
          case "positionWindowResponse":
            resolve(response.positionWindowResponse);
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

// Developer Facing API
const isValidFrame = async (frame: {
  width: number;
  height: number;
  anchorX: number;
}): Promise<PositionWindowResponse> =>
  sendWindowPositionRequest({
    size: { width: frame.width, height: frame.height },
    anchor: { x: frame.anchorX, y: 0 },
    dryrun: true,
  });

const WindowPosition = { isValidFrame };

export default WindowPosition;
