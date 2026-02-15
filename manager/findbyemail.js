import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const tableName = process.env.TABLE_NAME;

const dbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dbClient);

export const findByEmail = async (email, courseId) => {
    const getCommand = new GetCommand({
        'TableName': tableName,
        'Key': {
            'email': email,
            'course_id': courseId
        }
    });
    const data = await docClient.send(getCommand);
    return data.Item;
};
