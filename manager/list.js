import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const listUsersByCourse = async (courseId, role) => {
  const params = {
    TableName: process.env.TABLE_NAME,
    IndexName: "RoleIndex",
    KeyConditionExpression: "course_id = :courseId AND #role = :role",
    ExpressionAttributeNames: {
      "#role": "role"
    },
    ExpressionAttributeValues: {
      ":courseId": courseId,
      ":role": role
    }
  };

  const items = [];
  let lastEvaluatedKey;

  do {
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
    const result = await docClient.send(new QueryCommand(params));
    items.push(...result.Items);
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
};
