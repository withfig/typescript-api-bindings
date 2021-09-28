import {
    PseudoterminalExecuteRequest,
    PseudoterminalExecuteResponse,
    PseudoterminalWriteRequest
  } from "./fig";
  
  import { sendMessage } from "./core";

  export const sendPseudoterminalExecuteRequest = async (
    request: PseudoterminalExecuteRequest
  ): Promise<PseudoterminalExecuteResponse> =>
    new Promise((resolve, reject) => {
      const requestName = "pseudoterminalExecuteRequest";
      sendMessage(
        { $case: requestName, pseudoterminalExecuteRequest: request },
        (response) => {
          switch (response?.$case) {
            case "pseudoterminalExecuteResponse":
              resolve(response.pseudoterminalExecuteResponse);
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
  
    export const sendPseudoterminalWriteRequest = async (
        request: PseudoterminalWriteRequest
      ): Promise<void> =>
        new Promise((resolve, reject) => {
          const requestName = "pseudoterminalWriteRequest";
          sendMessage(
            { $case: requestName, pseudoterminalWriteRequest: request },
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

const execute = async (
    command: string,
    options: {
      env: Record<string, string> | undefined,
      directory: string | undefined,
      isPipelined: boolean | undefined,
      backgroundJob: boolean | undefined,
    } | undefined
    ): Promise<PseudoterminalExecuteResponse> =>
    sendPseudoterminalExecuteRequest({
      command: command,
      isPipelined: options?.isPipelined ?? false,
      backgroundJob: options?.backgroundJob ?? true,
      workingDirectory: options?.directory,
      env: []
    });
    
const write = async (
  text: string,
): Promise<void> => sendPseudoterminalWriteRequest({
  input: {
    $case: "text",
    text: text
  }
})

const PTY = { execute, write };

export default PTY;