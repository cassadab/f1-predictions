import { Connection, createConnection, RowDataPacket } from 'mysql2/promise';
import { RDS } from 'aws-sdk';
import { Driver, FullRanking, PredictionRecord, SpecialDrivers } from './f1.interfaces';

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

async function getPrediction(discordId: string, conn: Connection): Promise<PredictionRecord> {
  console.log(`Obtaining prediction record for ${discordId}`);
  const sql = `select * from predictions where discord_id=?`;
  const values = [discordId];
  const result = await conn.execute(sql, values);
  const records = result[0] as RowDataPacket[];

  if (!(records.length > 0)) {
    console.log(`No prediction found for ${discordId}`);
    return null;
  }
  return records[0] as PredictionRecord;
}

async function getRankings(discordId: string, conn: Connection): Promise<FullRanking[]> {
  console.log(`Obtaining rankings for ${discordId}`);
  const sql = `SELECT r.rank as prediction_rank, r.driver, d.name, d.team, d.rank, d.country 
    FROM rankings r
    INNER JOIN drivers d
    ON r.driver=d.code
    WHERE prediction_id=?
    ORDER BY prediction_rank`;
  const values = [discordId];
  const result = await conn.execute(sql, values);
  const records = result[0] as FullRanking[];
  return records;
}

async function getSpecialDrivers(dnf: string, overtake: string, conn: Connection): Promise<SpecialDrivers> {
  const sql = `SELECT code, name, team, rank, country FROM drivers WHERE code in (?, ?)`;
  const values = [dnf, overtake];
  const result = await conn.execute(sql, values);
  const drivers = result[0] as Driver[];
  const overtakeDriver = drivers.find(driver => driver.code == overtake);
  const dnfDriver = drivers.find(driver => driver.code == dnf);
  return {
    overtake: overtakeDriver,
    dnf: dnfDriver,
  } as SpecialDrivers;
}

function updatePredictionScore(discordId: string, score: number, conn: Connection) {
  const sql = `UPDATE predictions SET score=? WHERE discord_id=?`;
  const values = [score, discordId];

  return conn.execute(sql, values);
}

export { initConnection, getPrediction, getRankings, getSpecialDrivers, updatePredictionScore };
