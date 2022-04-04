import { Driver } from './f1.interfaces';

import { Lambda } from 'aws-sdk';
import { initConnection } from './dbService';
import { Connection, RowDataPacket } from 'mysql2/promise';

const lambda = new Lambda();

export const handler = async (event: any): Promise<void> => {
  console.log('Updating predictions scores');

  const conn = await initConnection();

  const discordIds = await retrieveDiscordIds(conn);

  await conn.beginTransaction();

  await conn.commit();
  await conn.end();
};

async function retrieveDiscordIds(conn: Connection): Promise<string[]> {
  const sql = `select discord_id from predictions`;
  const sqlResult = await conn.query(sql);
  const result = sqlResult[0] as RowDataPacket[];
  return result.map(row => row['discord_id']);
}
