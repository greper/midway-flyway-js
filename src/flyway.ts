import * as path from 'path';
import * as fs from 'fs';
import { getConnection, QueryRunner, Table } from 'typeorm';
import { FlywayHistory } from './entity';
import * as crypto from 'crypto';

/**
 * 脚本文件信息
 */
class ScriptFile {
  script: string;
  isBaseline = false;

  constructor(fileName, isBaseline) {
    this.script = fileName;
    this.isBaseline = isBaseline;
  }
}

const DefaultLogger = {
  debug: function (...args) {
    console.log(args);
  },
  info: function (...args) {
    console.log(args);
  },
  warn: function (...args) {
    console.warn(args);
  },
  error: function (...args) {
    console.error(args);
  },
};
export class Flyway {
  scriptDir;
  flywayTableName;
  baseline;
  allowHashNotMatch;
  connection;
  logger;
  constructor(opts) {
    this.scriptDir = opts.scriptDir ?? 'db/migration';
    this.flywayTableName = opts.flywayTableName ?? 'flyway_history';
    this.baseline = opts.baseline ?? false;
    this.allowHashNotMatch = opts.allowHashNotMatch ?? false;
    this.logger = opts.logger || DefaultLogger;
  }

  async run(ignores?: (RegExp | string)[]) {
    this.logger.info('[ midfly ] start-------------');
    if (!fs.existsSync(this.scriptDir)) {
      this.logger.info('[ midfly ] scriptDir<'+this.scriptDir+'> not found');
      return;
    }

    this.connection = await getConnection();

    const scriptFiles = await this.loadScriptFiles();
    const queryRunner = this.connection.createQueryRunner();
    await this.prepare(queryRunner);
    for (const file of scriptFiles) {
      if (this.isNeedIgnore(file.script, ignores)) {
        continue;
      }
      const filepath = path.resolve(this.scriptDir, file.script);

      await queryRunner.startTransaction();
      try {
        //查找是否已经执行
        if (await this.hasExec(file.script, filepath, queryRunner)) {
          await queryRunner.commitTransaction();
          continue;
        }
        if (!file.isBaseline) {
          this.logger.info('need exec script file: ', file.script);
          //执行sql文件
          if (/\.sql$/.test(file.script)) {
            await this.execSql(filepath, queryRunner);
          }
          // 执行js或者ts
          // if (/\.(js|ts)$/.test(file.script)) {
          //   await this.execJsOrTs(filepath, t);
          // }
        } else {
          this.logger.info('baseline script file: ', file.script);
        }
        await this.storeSqlExecLog(file.script, filepath, true, queryRunner);
        await queryRunner.commitTransaction();
      } catch (err) {
        await this.storeSqlExecLog(file.script, filepath, false, queryRunner);
        await queryRunner.rollbackTransaction();
        throw err;
      }
    }
    this.logger.info('[ midfly ] end-------------');
  }

  private async storeSqlExecLog(
    filename: string,
    filepath: string,
    success: boolean,
    queryRunner: QueryRunner
  ) {
    const hash = await this.getFileHash(filepath);
    //先删除
    await queryRunner.manager.delete(FlywayHistory, {
      name: filename
    });
    const history = await queryRunner.manager.insert(FlywayHistory, {
      name: filename,
      hash,
      timestamp: new Date().getTime(),
      success,
    });
    return history;
  }

  /**
   * 读取升级脚本文件
   * @private
   */
  private async loadScriptFiles() {
    const files = fs.readdirSync(this.scriptDir);
    files.sort();
    // 获取基准脚本的位置
    const local = files.indexOf(this.baseline);
    const scriptFiles = new Array<ScriptFile>();
    files.forEach((file, index) => {
      if (index <= local) {
        // 基准脚本和基准脚本之前的脚本都执行
        scriptFiles.push(new ScriptFile(file, true));
      } else {
        scriptFiles.push(new ScriptFile(file, false));
      }
    });
    return scriptFiles;
  }

  /**
   * 创建history表
   * @private
   */
  private async prepare(queryRunner: QueryRunner) {
    await this.createFlywayTableIfNotExist(queryRunner);
  }

  /**
   * Creates table "flyway_history" that will store information about executed migrations.
   */
  protected async createFlywayTableIfNotExist(
    queryRunner: QueryRunner
  ): Promise<void> {
    // If driver is mongo no need to create
    // if (this.connection.driver instanceof MongoDriver) {
    //   return;
    // }
    const tableExist = await queryRunner.hasTable(this.flywayTableName); // todo: table name should be configurable
    if (!tableExist) {
      await queryRunner.createTable(
        new Table({
          name: this.flywayTableName,
          columns: [
            {
              name: 'id',
              type: this.connection.driver.normalizeType({
                type: this.connection.driver.mappedDataTypes.migrationId,
              }),
              isGenerated: true,
              generationStrategy: 'increment',
              isPrimary: true,
              isNullable: false,
            },
            {
              name: 'timestamp',
              type: this.connection.driver.normalizeType({
                type: this.connection.driver.mappedDataTypes.migrationTimestamp,
              }),
              isPrimary: false,
              isNullable: false,
            },
            {
              name: 'name',
              type: this.connection.driver.normalizeType({
                type: this.connection.driver.mappedDataTypes.migrationName,
              }),
              isNullable: false,
            },
            {
              name: 'hash',
              type: this.connection.driver.normalizeType({
                type: this.connection.driver.mappedDataTypes.migrationName,
              }),
              isNullable: true,
            },
            {
              name: 'success',
              type: this.connection.driver.normalizeType({
                type: 'boolean',
              }),
              isNullable: true,
            },
          ],
        })
      );
    }
  }

  private isNeedIgnore(file: string, ignores?: (RegExp | string)[]): boolean {
    if (!ignores) {
      ignores = [/\.js\.map$/, /\.d\.ts$/];
    }
    let ret = false;
    for (const ignore of ignores) {
      if (typeof ignore === 'string' && file === ignore) {
        ret = true;
        break;
      }
      if (ignore instanceof RegExp && ignore.test(file)) {
        ret = true;
        break;
      }
    }
    return ret;
  }

  private async hasExec(
    file: string,
    filepath: string,
    queryRunner: QueryRunner
  ): Promise<boolean> {
    const hash = await this.getFileHash(filepath);

    const history = await queryRunner.manager.findOne(FlywayHistory, {
      where: { name: file, success: true },
    });

    if (history) {
      if (history.hash !== hash && this.allowHashNotMatch === false) {
        throw new Error(file + `hash conflict ,old: ${history.hash} != new: ${hash}`);
      }
      return true;
    }
    return false;
  }

  private async getFileHash(filepath: string) {
    const content = fs.readFileSync(filepath).toString();
    return crypto.createHash('md5').update(content.toString()).digest('hex');
  }

  private async execSql(filepath: string, queryRunner: QueryRunner) {
    this.logger.info('[ midfly ] exec ', filepath);
    const content = fs.readFileSync(filepath).toString();
    const arr = this.slipt2Array(content, ';', ';');
    let index = 0;
    for (const s of arr) {
      await this.execOnePart(s, index, queryRunner);
      index++;
    }
  }

  private async execOnePart(
    sql: string,
    index: number,
    queryRunner: QueryRunner
  ) {
    this.logger.info('exec sql: ', index);
    try {
      await queryRunner.query(sql);
    } catch (err) {
      this.logger.error('exec sql error ： ', err.message);
      throw err;
    }
  }

  /**
   * 将字符串分割为数组
   * @param {string} str 字符串
   * @param {string} splitter 分隔符，默认','
   * @param {string} repair 尾补符号，分割后的字符串尾部增补符号，默认无尾补符号
   */
  slipt2Array(str, splitter, repair = '') {
    if (!str) {
      return [];
    }

    const temp = String(str).trim();

    if (temp === 'null') {
      return [];
    }

    const arr = temp.split(!splitter ? ',' : splitter);
    const back = [];
    arr.forEach((s, index) => {
      if (s) {
        back[index] = s.trim() + repair;
      }
    });

    return back;
  }
}
