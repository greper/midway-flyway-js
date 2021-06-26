import { ALL, Config, Configuration, Logger } from '@midwayjs/decorator';
import { Flyway } from './flyway';
import { ILogger } from '@midwayjs/logger';

@Configuration({
  namespace: 'flyway',
  //importConfigs: [join(__dirname, './config')],
})
export class FlywayConfiguration {
  @Config(ALL)
  flyway;

  @Logger()
  logger: ILogger;
  async onReady() {
    await new Flyway({ ...this.flyway, logger: this.logger }).run();
  }
}
