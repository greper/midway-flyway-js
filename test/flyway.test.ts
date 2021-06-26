import {Flyway} from "../src/flyway";
import {getConnection, createConnections} from 'typeorm';
import * as fs from 'fs'

const dbPath = "./data/db.sqlite"
describe('test/flyway/flyway.test.ts', () => {

  beforeEach(async () => {
    if (fs.existsSync(dbPath)) {
      fs.rmSync(dbPath)
    }
    await createConnections();
    console.log('before each')
  });

  afterEach(async () => {
    // close app
    const connection = await getConnection();
    await connection.close();
    // if (fs.existsSync(dbPath)) {
    //   fs.rmSync(dbPath)
    // }
    console.log('after each')
  });

  it('split', async () => {
    let opts = {
      scriptDir: "./test/db/split"
    };
    const content = fs.readFileSync("./test/db/split/split.sql").toString();
    const sqlArray = new Flyway(opts).splitSql2Array(content)
    console.log('sql array',sqlArray)
    expect(sqlArray.length).toBe(1);
  });

  it('semicolon', async () => {
    let opts = {
      scriptDir: "./test/db/semicolon"
    };
    await new Flyway(opts).run();
    const connection = await getConnection();
    const queryRunner = connection.createQueryRunner();
    const flywayHistoryRet = await queryRunner.query("select *  from flyway_history");
    console.log('flywayHistoryRet', flywayHistoryRet)
    expect(flywayHistoryRet.length).toBe(1);
  });

  it('success normal', async () => {
    let opts = {
      scriptDir: "./test/db/migration"
    };
    await new Flyway(opts).run();
    const connection = await getConnection();
    const queryRunner = connection.createQueryRunner();
    const ret = await queryRunner.query("select count(*) as count from sys_user");
    console.log('useCount',ret)
    expect(ret[0].count).toBe(4);

    const flywayHistoryRet = await queryRunner.query("select *  from flyway_history");
    console.log('flywayHistoryRet',flywayHistoryRet)
    expect(flywayHistoryRet.length).toBe(3);
    expect(flywayHistoryRet[0].id).toBe(1);
    expect(flywayHistoryRet[0].success).toBe(1);
    expect(flywayHistoryRet[0].name).toBe('v1__init.sql');

    //再运行一次，应该没有变化
    await new Flyway(opts).run();
    const flywayHistoryRet2 = await queryRunner.query("select *  from flyway_history");
    expect(flywayHistoryRet.length).toBe(3);
    expect(flywayHistoryRet2[0].id).toBe(1);

  });


  it('base line', async () => {
    let opts = {
      scriptDir: "./test/db/baseline",
      baseline: 'v0__baseline.sql'
    };
    try {
      await new Flyway(opts).run();
    } catch (e) {
      console.log('error',e)
      throw e
    }
    const connection = await getConnection();
    const queryRunner = connection.createQueryRunner();
    const ret = await queryRunner.query("select count(*) as count from sys_user");
    console.log('useCount', ret)
    expect(ret[0].count).toBe(2);

    const flywayHistoryRet = await queryRunner.query("select *  from flyway_history");
    console.log('flywayHistoryRet', flywayHistoryRet)
    expect(flywayHistoryRet.length).toBe(2);
    expect(flywayHistoryRet[0].id).toBe(1);
    expect(flywayHistoryRet[0].success).toBe(1);
    expect(flywayHistoryRet[0].name).toBe('v0__baseline.sql');
    expect(flywayHistoryRet[1].name).toBe('v1__init.sql');

  });

  it('hash check', async () => {
    let opts = {
      scriptDir: "./test/db/migration"
    };
    await new Flyway(opts).run();
    const connection = await getConnection();
    const queryRunner = connection.createQueryRunner();
    const ret = await queryRunner.query("select count(*) as count from sys_user");
    console.log('useCount',ret)
    expect(ret[0].count).toBe(4);

    //再运行一次，应该抛异常
    let error
    try{
      opts.scriptDir="./test/db/hash-check"
      await new Flyway(opts).run();
    }catch (e){
      error = e.message;
    }
    expect(error).toContain('hash conflict');

  });


  it('blank sql', async () => {
    let opts = {
      scriptDir: "./test/db/blank"
    };
    await new Flyway(opts).run();
    const connection = await getConnection();
    const queryRunner = connection.createQueryRunner();
    const flywayHistoryRet = await queryRunner.query("select *  from flyway_history");
    console.log('flywayHistoryRet', flywayHistoryRet)
    expect(flywayHistoryRet.length).toBe(1);

  });




});
