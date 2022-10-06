import {Config, Configuration, Logger} from '@midwayjs/decorator';
import { Flyway } from './flyway';
import { ILogger } from '@midwayjs/logger';
import {TypeORMDataSourceManager} from "@midwayjs/typeorm";
import {IMidwayContainer} from "@midwayjs/core";

@Configuration({
  namespace: 'flyway',
  //importConfigs: [join(__dirname, './config')],
})
export class FlywayConfiguration {
  @Config()
  flyway;
  @Logger()
  logger: ILogger;
  async onReady(container: IMidwayContainer) {
    this.logger.info('flyway start:' + JSON.stringify(this.flyway));
    const dataSourceManager = await container.getAsync(TypeORMDataSourceManager);
    const dataSourceName = this.flyway.dataSourceName || 'default'
    const connection = dataSourceManager.getDataSource(dataSourceName);
    await new Flyway({ ...this.flyway, logger: this.logger,connection }).run();
  }
}
