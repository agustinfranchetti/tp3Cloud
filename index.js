var AWS = require('aws-sdk');
var { nanoid } = require('nanoid');
var moment = require('moment');
var handler = async (event) => {
  var dynamodb = new AWS.DynamoDB({
      apiVersion: '2012-08-10',
      endpoint: 'http://dynamodb:8000',
      region: 'us-west-2',
      credentials: {
          accessKeyId: '2345',
          secretAccessKey: '2345' 
      }
  });
    var docClient = new AWS.DynamoDB.DocumentClient({
        apiVersion: '2012-08-10',
        service: dynamodb
    });
    
    //return {body: JSON.stringify(envio, null, 2)};

    switch(event.httpMethod){
        case 'POST':
            const envio = JSON.parse(event.body);
            envio.fechaAlta = moment().toISOString();
            envio.pendiente = envio.fechaAlta;
            envio.id = nanoid();

            return docClient.put({
                TableName: 'Envio',
                Item: envio
            })
            .promise()
            .then (result => {
                return{
                    statusCode: 201,
                    body: JSON.stringify(envio, null, 2)
                }
            })
            .catch(error => errorResponse(error));
        case 'GET':
            return docClient.scan({
                TableName: 'Envio',
                IndexName: 'EnviosPendientesIndex'
            })
            .promise()
            .then(data => {
                return{
                    body: JSON.stringify(data.Items, null, 2)
                }
            })
            .catch(error => errorResponse(error));
        case 'PUT':
            const id = event.pathParameters.idEnvio;
            return docClient.update({
                TableName: 'Envio',
                Key: { id:id },
                UpdateExpression: 'REMOVE pendiente'
            })
            .promise()
            .then(result => {
                return{
                    statusCode: 200
                }
            })
            .catch(error => errorResponse(error));
    }
}

const errorResponse = error => ({
    statusCode: 500,
    body: JSON.stringify(error, null, 2)
});

exports.handler=handler;