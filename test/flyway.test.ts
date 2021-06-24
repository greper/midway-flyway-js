import {Flyway} from "../src/flyway";
 import { createConnections } from 'typeorm';

describe('test/flyway/flyway.test.ts', () => {

  it('should init sql', async () => {
    // create app

    await createConnections();
    await new Flyway({
      scriptDir:"./test/db/migration"
    }).run();


    console.log('run success')
  //  const connection = await getConnection();
    //console.log('run connection',connection)
    // const queryRunner = connection.createQueryRunner();
    //
    // const ret = await queryRunner.query("select count(*) from sys_user");
    // console.log('ret',ret)
    // // use expect by jest
    // expect(result.status).toBe(200);
    // expect(result.body.message).toBe('OK');
    //
    // // or use assert
    // assert.deepStrictEqual(result.status, 200);
    // assert.deepStrictEqual(result.body.data.uid, '123');
    //
    // // close app
    // await close(app);
  });
});
