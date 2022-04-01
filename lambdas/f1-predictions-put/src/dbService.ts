import { Connection, createConnection, RowDataPacket } from 'mysql2/promise';
import { PutPredictionRequest } from './predictions-put.interfaces';
import { RDS } from 'aws-sdk';

const DATABASE_NAME = 'f1_predictions';

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

function insertPrediction(body: PutPredictionRequest, conn: Connection) {
  console.log(`Inserting prediction for ${body.discord}`);
  const sql = `INSERT INTO predictions (discord_id,name,country,dnf,overtake,score) VALUES(?,?,?,?,?, 0)`;
  const values = [body.discord, body.name, body.country, body.dnf, body.overtake];
  return conn.execute(sql, values);
}

function insertRankings(body: PutPredictionRequest, conn: Connection) {
  console.log(`Inserting rankings for ${body.discord}`);
  return body.driverRankings.map((driverCode, index) => {
    const sql = 'INSERT INTO rankings (prediction_id,driver,standing) VALUES(?,?,?)';
    const values = [body.discord, driverCode, index + 1];
    return conn.execute(sql, values);
  });
}

async function predictionExists(body: PutPredictionRequest, conn: Connection): Promise<boolean> {
  const sql = `SELECT discord_id from predictions WHERE discord_id=?`;
  const values = [body.discord];
  const result = await conn.execute(sql, values);
  const records = result[0] as RowDataPacket[];
  return records.length > 0;
}

function removeRankings(body: PutPredictionRequest, conn: Connection) {
  console.log(`Removing existing rankings for ${body.discord}`);
  const sql = `DELETE FROM rankings WHERE prediction_id=?`;
  const values = [body.discord];
  return conn.execute(sql, values);
}

function updatePrediction(body: PutPredictionRequest, conn: Connection) {
  console.log(`Updating prediction for ${body.discord}`);
  const sql = `UPDATE predictions SET dnf=?, overtake=? WHERE discord_id=?`;
  const values = [body.dnf, body.overtake, body.discord];
  return conn.execute(sql, values);
}

export { initConnection, insertPrediction, insertRankings, predictionExists, removeRankings, updatePrediction };
