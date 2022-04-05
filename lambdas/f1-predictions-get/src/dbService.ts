import { Connection, createConnection, RowDataPacket } from 'mysql2/promise';
import { RDS } from 'aws-sdk';

const DATABASE_NAME = 'f1_predictions';

async function getRankings(discordId: string, conn: Connection) {
  const sql = `SELECT r.standing AS predictionRank, d.code, d.team, d.country, d.standing AS driverStanding, (0 - ABS(r.standing - d.standing)) AS score 
    FROM rankings r
    JOIN drivers d ON r.driver = d.code AND r.prediction_id=?
    ORDER BY predictionRank`;
  const values = [discordId];

  const [rows, fields] = await conn.execute(sql, values);
  console.log(JSON.stringify(rows));
  return rows;
}

async function getPrediction(discordId: string, conn: Connection) {
  const sql = `SELECT discord_id AS discord, name, country, dnf, overtake
    FROM predictions
    WHERE discord_id=?`;
  const values = [discordId];

  const sqlResult = await conn.execute(sql, values);
  const rows = sqlResult[0] as RowDataPacket[];
  return rows[0];
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

export { getPrediction, getRankings, initConnection };
