import { sendPositionWindowRequest } from './requests';

/**
 * Get info about the autocomplete view frame and position on the screen.
 * @param frame 
 * @returns A response object containing info about the specified frame.
 */
export const isValidFrame = async (frame: {
  width: number;
  height: number;
  anchorX: number;
}) =>
  sendPositionWindowRequest({
    size: { width: frame.width, height: frame.height },
    anchor: { x: frame.anchorX, y: 0 },
    dryrun: true,
  });
