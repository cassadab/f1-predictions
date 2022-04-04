import { Driver, UpdateDriversEvent } from './f1.interfaces';

import { Lambda } from 'aws-sdk';
import { initConnection } from './dbService';

const lambda = new Lambda();

export const handler = async (event: UpdateDriversEvent): Promise<void> => {
  console.log('Updating driver scores');

  const conn = await initConnection();
  await conn.beginTransaction();

  const sql = `update drivers set standing=? where code=?`;
  const executePromises = event.standings.map(driver => {
    const values = [driver.rank, driver.code];
    return conn.execute(sql, values);
  });

  await Promise.all(executePromises);

  await conn.commit();
  await conn.end();
};
