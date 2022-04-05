import { Connection, createConnection, RowDataPacket } from 'mysql2/promise';
import { RDS } from 'aws-sdk';

const DATABASE_NAME = 'f1_predictions';

async function getStandings(conn: Connection) {
  const sql = `SELECT p.name, p.country, standings.score 
    FROM predictions p
    JOIN (
        SELECT id, SUM(a.score) AS score 
        FROM (
            SELECT r.prediction_id as id, r.rank as prediction_rank, d.code, d.rank as driver_standing, (0 - ABS(r.rank - d.rank)) AS score 
            FROM rankings r
            JOIN drivers d ON r.driver = d.code
        ) a
        GROUP BY id
        ORDER BY score DESC
    ) standings on standings.id = p.discord`;

  const sqlResult = await conn.query(sql);
  const result = sqlResult[0] as RowDataPacket[];
  return result;
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

export { getStandings, initConnection };