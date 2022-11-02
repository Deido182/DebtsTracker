const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const debtsTableName = process.env.DEBTS_TABLE_NAME_PROD;

async function setup(email) {
    const params = { 
        'TableName': debtsTableName, 
        'Item': {
            'email': email, 
            'currentList': []
        }
    };
    console.log('Going to setup debts table for: ' + email);
    return await dynamo.put(params).promise();
}

exports.handler = async (event, context, callback) => {
    console.log(event);
    
    const email = event.request.userAttributes.email;
    if (email) {
        await setup(email);
    }
    
    // Return to Amazon Cognito
    callback(null, event);
};
