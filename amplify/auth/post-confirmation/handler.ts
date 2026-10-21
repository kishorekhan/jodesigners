import type { PostConfirmationTriggerHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({});

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const groupName = process.env.GROUP_NAME || "customer";

  const command = new AdminAddUserToGroupCommand({
    UserPoolId: event.userPoolId,
    Username: event.userName,
    GroupName: groupName,
  });

  try {
    await client.send(command);
    console.log(`Successfully added user ${event.userName} to group ${groupName}`);
  } catch (error) {
    console.error("Error adding user to group:", error);
    // Return event so user confirmation isn't blocked if group addition fails
  }

  return event;
};
