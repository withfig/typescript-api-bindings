import { Project, PropertySignature, SourceFile, CodeBlockWriter } from "ts-morph";
const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

const lowercaseFirstLetter = (str: string) => {
return str.charAt(0).toLowerCase() + str.slice(1);
}


const normalize = (type: string): string  =>  {
    let normalized = type
    if (type.endsWith("Request")) {
        normalized = type.replace("Request", "")
    } else if (type.endsWith("Response")) {
        normalized = type.replace("Response", "")
    }

    return capitalizeFirstLetter(normalized)
}

let getSubmessageTypes = (bindings: SourceFile, interfaceName: string) => {
    const interfaceRef = bindings.getInterface(interfaceName)!;
    const submessage = interfaceRef.getProperties()[1]

    const submessageUnion = submessage.getChildren().filter(elm => elm.getKindName() === "UnionType")[0]
    const literals = submessageUnion.getChildren()[0].getChildren().filter(elm => elm.getKindName() === "TypeLiteral")
    const types = literals.map(elm => elm.getChildren()[1]).map(elm => elm.getChildren()[1])
    return types.map(prop => (prop as PropertySignature).getName())
}

const writeGenericSendRequestWithResponseFunction = (writer: CodeBlockWriter, endpoint: string) => {

    let lowercasedEndpoint = lowercaseFirstLetter(endpoint)

    const template = 
    `export const send${endpoint}Request = async (
    request: ${endpoint}Request
    ): Promise<${endpoint}Response> =>
    new Promise((resolve, reject) => {
      sendMessage(
        { $case: "${lowercasedEndpoint}Request", ${lowercasedEndpoint}Request: request },
        (response) => {
          switch (response?.$case) {
            case "${lowercasedEndpoint}Response":
              resolve(response.${lowercasedEndpoint}Response);
              break;
            case "error":
              reject(Error(response.error));
              break;
            default:
              reject(
                Error(
                    "Invalid response '" + response?.$case + "' for '${endpoint}Request'"
                )
              );
          }
        }
      );
    });`

    writer.writeLine(template).blankLine()
}

const writeGenericSendRequestFunction = (writer: CodeBlockWriter, endpoint: string) => {
    let lowercasedEndpoint = lowercaseFirstLetter(endpoint)

    const template = 
    `export const send${endpoint}Request = async (
        request: ${endpoint}Request
    ): Promise<void> =>
    new Promise((resolve, reject) => {
      sendMessage(
        { $case: "${lowercasedEndpoint}Request", ${lowercasedEndpoint}Request: request },
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
                  "Invalid response '" + response?.$case + "' for '${endpoint}Request'"
                )
              );
          }
        }
      );
    });
    `
    writer.writeLine(template).blankLine()

}

const project = new Project();

project.addSourceFilesAtPaths(process.env.PWD  + "/src/*.ts");

const protobufBindings = project.getSourceFileOrThrow(process.env.PWD + "/src/fig.ts");

const requestTypes = getSubmessageTypes(protobufBindings, "ClientOriginatedMessage")
const responseTypes = getSubmessageTypes(protobufBindings, "ServerOriginatedMessage").filter(type => type.includes("Response"))


let [ requestsWithMatchingResponses, otherRequests ] = requestTypes.filter( request => request != "notificationRequest").reduce((result, request) => {
    let [matchingResponse, other] = result

    const endpoint = lowercaseFirstLetter(normalize(request))

    if (responseTypes.indexOf(endpoint + "Response") != -1) {
        return [matchingResponse.concat([request]), other]
    } else {
        return [matchingResponse, other.concat([request])]
    }

}, [[] as string[],[] as string[]])

console.log(requestsWithMatchingResponses, otherRequests)

const sourceFile = project.createSourceFile(process.env.PWD + "/src/requests.ts",  writer => {
    writer.writeLine(`/* Autogenerated by generate-requests.ts on ${(new Date()).toLocaleDateString("en-US")}`)
    writer.writeLine(` * Do not edit directly! Instead run 'npm run generate-requests'`)
    writer.writeLine(` */`).blankLine()

    const responses = requestsWithMatchingResponses.map(request => request.replace("Request", "Response"))
    const imports = requestsWithMatchingResponses.concat(responses).concat(otherRequests).sort().map(capitalizeFirstLetter)
    writer.writeLine(`import { \n${imports.join(",\n")}\n } from "./fig";`)
    writer.writeLine(`import { sendMessage } from "./core"`).blankLine()

    requestsWithMatchingResponses.forEach(request => writeGenericSendRequestWithResponseFunction(writer, normalize(request)))
    otherRequests.forEach(request => writeGenericSendRequestFunction(writer, normalize(request)))

}, { overwrite: true });

sourceFile.formatText();
sourceFile.saveSync()
