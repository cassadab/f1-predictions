import { Connection, createConnection, RowDataPacket } from 'mysql2/promise';
import { RDS } from 'aws-sdk';
import { Driver, FullRanking, PredictionRecord, SpecialDrivers } from './f1.interfaces';

const DATABASE_NAME = 'f1_predictions';

async function getPrediction(discordId: string, conn: Connection) {
  const sql = `select p.discord_id, p.name, p.country, p.dnf, p.overtake, b.score from predictions p
        JOIN (
        select id, SUM(a.score) as score from 
        (
            select r.prediction_id as id, r.rank as prediction_rank, d.code, d.rank as driver_standing, (0 - ABS(r.rank - d.rank)) as score 
            from rankings r
            JOIN drivers d ON r.driver = d.code AND r.prediction_id = ?
        ) a
        ) b ON p.discord_id = b.id;`;
  const values = [discordId];

  const sqlResult = await conn.execute(sql, values);
  const result = sqlResult[0] as RowDataPacket[];
  return result[0];
}

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

export { getPrediction, initConnection };
