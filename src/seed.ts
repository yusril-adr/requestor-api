import { runSeeders } from 'typeorm-extension';
import datasource from '@infrastructure/databases/requestor.ds';

(async () => {
  await datasource.initialize();

  await runSeeders(datasource);
})();
