import { Config, Configuration, Logger } from '@midwayjs/decorator';
import { Flyway } from './flyway';
import { ILogger } from '@midwayjs/logger';

@Configuration({
  namespace: 'flyway',
  //importConfigs: [join(__dirname, './config')],
})
export class FlywayConfiguration {
  @Config()
  flyway;

  @Logger()
  logger: ILogger;
  async onReady() {
    this.logger.info('flyway start:' + JSON.stringify(this.flyway));
    await new Flyway({ ...this.flyway, logger: this.logger }).run();
  }
}
