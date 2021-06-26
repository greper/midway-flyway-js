import { ALL, Config, Configuration, Logger } from '@midwayjs/decorator';
import { Flyway } from './flyway';
import { ILogger } from '@midwayjs/logger';

@Configuration({
  namespace: 'flyway',
  //importConfigs: [join(__dirname, './config')],
})
export class FlywayConfiguration {
  @Config(ALL)
  config;

  @Logger()
  logger: ILogger;
  async onReady() {
    this.logger.info('flyway start:', this.config.flyway);
    await new Flyway({ ...this.config.flyway, logger: this.logger }).run();
  }
}
