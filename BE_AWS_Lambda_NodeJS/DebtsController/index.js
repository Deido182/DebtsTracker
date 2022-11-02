const { OK, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const debtsTableName = process.env.DEBTS_TABLE_NAME_PROD;
const globalIdsTableName = process.env.GLOBAL_IDS_TABLE_NAME_PROD;
const jwt_decode = require('jwt-decode');

const operations = {
    settle: 'SETTLE', 
    confirm: 'CONFIRM', 
    cancel: 'CANCEL'
};

const customErrors = {
    negativeAmount: 'NEGATIVE_AMOUNT', 
    invalidEmail: 'INVALID_EMAIL', 
    invalidOperation: 'INVALID_OPERATION', 
    invalidId: 'INVALID_ID', 
    operationNotAllowed: 'OPERATION_NOT_ALLOWED'
};

async function atomicallyGetNextId() {
    // Atomic counter
    const params = {
        'TableName': globalIdsTableName,
        'Key': {
            'TableName': debtsTableName
        },
        'UpdateExpression': 'SET nextId = nextId + :inc',
        'ExpressionAttributeValues': {
            ':inc': 1
        },
        'ReturnValues': 'UPDATED_OLD'
    };
    try {
        const nextId = (await dynamo.update(params).promise()).Attributes.nextId;
        console.log('NextId: ' + nextId);
        return nextId;
    } catch(err) {
        console.log(err);
        return null;
    }
}

async function getMyAmounts(email) {
    console.log('Calling DynamoDB...');
    const params = { 
        'TableName': debtsTableName, 
        'Key': {
            'email': email
        }
    };
    console.log('To DynamoDB' + JSON.stringify(params));
    const body = await dynamo.get(params).promise();
    console.log('Received body: ' + JSON.stringify(body));
    if(body.Item == undefined)
        throw new Error(customErrors.invalidEmail);
    return body.Item.currentList;
}

async function atomicallyGetAmounts(myEmail, otherEmail) {
    const params = {
        'TransactItems': [{
            'Get': {
                'TableName': debtsTableName, 
                'Key': {
                    'email': myEmail
                }
            }
        }, {
            'Get': {
                'TableName': debtsTableName, 
                'Key': {
                    'email': otherEmail
                }
            }
        }]  
    };
    console.log('To DynamoDB: ' + JSON.stringify(params));
    const body = await dynamo.transactGet(params).promise();
    console.log('Received body: ' + JSON.stringify(body));
    if(body.Responses.length != 2 || body.Responses.filter(x => x == null).length != 0)
        throw new Error(customErrors.invalidEmail);
    return { 'myList': body.Responses.find(x => x.Item.email == myEmail).Item.currentList, 
             'otherList': body.Responses.find(x => x.Item.email == otherEmail).Item.currentList };
}

async function atomicallyPutAmounts(myEmail, myNewList, otherEmail, otherNewList) {
    const params = {
        'TransactItems': [{
            'Put': {
                'TableName': debtsTableName, 
                'Item': {
                    'email': myEmail, 
                    'currentList': myNewList
                }
            }
        }, {
            'Put': {
                'TableName': debtsTableName, 
                'Item': {
                    'email': otherEmail, 
                    'currentList': otherNewList
                }
            }
        }]  
    };
    console.log('To DynamoDB: ' + JSON.stringify(params));
    await dynamo.transactWrite(params).promise();
}

async function getListWithNewAmount(currentList, amount, confirmed, nextId) {
    if(amount.quantity <= 0)
        throw new Error(customErrors.negativeAmount);
    console.log('Current list: ' + currentList);
    let newList = currentList == undefined ? [] : [...currentList];
    newList.push({ ...amount, confirmed: confirmed, id: nextId, date: new Date().toString(), paidOn: null });
    return newList;
}

async function addAmountHandler(myEmail, amount) {
    if(myEmail == amount.involved)
        throw new Error(customErrors.invalidEmail);
    // These MUST be atomic
    var currentLists = await atomicallyGetAmounts(myEmail, amount.involved);
    const nextId = await atomicallyGetNextId();
    const otherNewList = await getListWithNewAmount(currentLists.otherList, { ...amount, involved: myEmail, isCredit: !amount.isCredit }, !amount.isCredit, nextId);
    const myNewList = await getListWithNewAmount(currentLists.myList, amount, !amount.isCredit, nextId);
    // It MUST be atomic
    await atomicallyPutAmounts(myEmail, myNewList, amount.involved, otherNewList);
}

async function getListWithModAmount(currentList, check, mod, id) {
    const pos = currentList.findIndex(x => x.id == id);
    if(pos == -1)
        throw new Error(customErrors.invalidId);
    if(!check(currentList[pos]))
        throw new Error(customErrors.operationNotAllowed);
    currentList[pos] = mod(currentList[pos]);
    return currentList.filter(x => x != null);
}

const isNewReceivedDebt =       amount => !amount.isCredit && !amount.confirmed && amount.paidOn == null;
const isConfirmedDebt =         amount => !amount.isCredit && amount.confirmed && amount.paidOn == null;
const isPaidDebtToBeConfirmed = amount => !amount.isCredit && !amount.confirmed && amount.paidOn != null;
const isNewProposedCredit =     amount => amount.isCredit && !amount.confirmed && amount.paidOn == null;
const isConfirmedCredit =       amount => amount.isCredit && amount.confirmed && amount.paidOn == null;
const isPossiblyPaidCredit =    amount => amount.isCredit && !amount.confirmed && amount.paidOn != null;

async function modAmountHandler(myEmail, otherEmail, operation, id) {
    console.log('Other email: ' + otherEmail + '; requested operation ' + operation + ' on id ' + id);
    var myCheck = null; 
    var myMod = null;
    var otherMod = null;
    switch (operation) {
        case operations.settle:
            myCheck = amount => isConfirmedCredit(amount) || isConfirmedDebt(amount);
            myMod = amount => { return { ...amount, confirmed: isConfirmedCredit(amount), paidOn: new Date().toString() } };
            otherMod = amount => { return { ...amount, confirmed: isConfirmedDebt(amount), paidOn: new Date().toString() } };
            break;
        case operations.confirm:
            myCheck = amount => isPossiblyPaidCredit(amount) || isNewReceivedDebt(amount);
            myMod = otherMod = amount => { return { ...amount, confirmed: true }; };
            break;
        case operations.cancel:
            myCheck = amount => isNewProposedCredit(amount) || isPossiblyPaidCredit(amount) || isNewReceivedDebt(amount) || isPaidDebtToBeConfirmed(amount);
            myMod = otherMod = amount => { return isNewProposedCredit(amount) || isNewReceivedDebt(amount) ? null : { ...amount, confirmed: true, paidOn: null }; };
            break;
        default:
            throw new Error(customErrors.invalidOperation);
    }
    // It MUST be atomic
    var currentLists = await atomicallyGetAmounts(myEmail, otherEmail);
    // This before, to avoid useless computation
    const myModList = await getListWithModAmount(currentLists.myList, myCheck, myMod, id);
    const otherModList = await getListWithModAmount(currentLists.otherList, amount => true, otherMod, id);
    // It MUST be atomic
    await atomicallyPutAmounts(myEmail, myModList, otherEmail, otherModList);
}

exports.handler = async (event, context) => {
    try {
        let response = {
            'statusCode': null,
            'headers': {
                'Access-Control-Allow-Headers' : 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
                'Content-Type': 'application/json',
            },
            'body': null,
            'isBase64Encoded': false
        };
        const token = event.headers.Authorization.split(' ')[1];
        const email = jwt_decode(token).email;
        const parsedReceivedBody = JSON.parse(event.body);
        
        console.log('My email: ' + email);
        console.log('Received body: ' + JSON.stringify(parsedReceivedBody));
        
        let body;
        switch (event.httpMethod) {
            case 'GET':
                body = { 'currentList': await getMyAmounts(email) };
                break;
            case 'POST':
                await addAmountHandler(email, parsedReceivedBody);
                break;
            case 'PUT': 
                await modAmountHandler(email, parsedReceivedBody.otherEmail, parsedReceivedBody.operation, parsedReceivedBody.id);
        }
        
        console.log('Returned body: ' + JSON.stringify(body));
        
        response.statusCode = OK;
        response.body = JSON.stringify(body);
        return response;
    } catch(err) {
        console.log(err);
        throw err;
    }
};


