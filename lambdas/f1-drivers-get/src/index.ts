import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { RDS } from 'aws-sdk';
import { Connection, createConnection } from 'mysql2/promise';

const DATABASE_NAME = 'f1_predictions';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyStructuredResultV2> => {
  // Should init this outside of handler eventually I think
  const conn = await initConnection();

  await conn.connect();
  const result = await conn.query(`select * from drivers ORDER BY standing is NULL, standing`);
  await conn.end();

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,GET',
    },
    body: JSON.stringify(result[0]),
  };

  return response;
};

function initConnection(): Promise<Connection> {
  const host = process.env.DATABASE_ENDPOINT.split(':')[0];

  const signer = new RDS.Signer({
    region: 'us-east-1',
    hostname: host,
    port: 3306,
    username: process.env.DATABASE_USERNAME,
  });

  const token = signer.getAuthToken({
    username: process.env.DATABASE_USERNAME,
  });

  const connectionConfig = {
    host,
    user: process.env.DATABASE_USERNAME,
    database: DATABASE_NAME,
    port: 3306,
    // ssl: { rejectUnauthorized: false },
    ssl: 'Amazon RDS',
    password: token,
    // TODO this is deprecated, use the new stuff
    authSwitchHandler: function(data: any, cb: any) {
      if (data.pluginName === 'mysql_clear_password') {
        cb(null, Buffer.from(token + '\0'));
      }
    },
  };

  return createConnection(connectionConfig);
}
