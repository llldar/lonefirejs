import { schemaComposer } from 'graphql-compose';
import getModelList from '../util/modelScanner';
import consts from '../util/consts';
import importHandler from '../util/importHandler';
import getLogger from '../util/logger';

const logger = getLogger(__filename.slice(__dirname.length + 1, -3));

const getGraphQLSchema = async () => {
  let graphqlSchema = null;
  try {
    const modelList = await getModelList();
    const tcPaths = modelList.map(model => `${consts.paths.model}${model}`);
    await Promise.all(
      tcPaths.map(async tcPath => {
        const typeComposer = await importHandler.importOne(
          tcPath,
          'typeComposer'
        );
        const modelName = tcPath.substring(tcPath.lastIndexOf('/') + 1);
        if (typeComposer) {
          schemaComposer.Query.addFields({
            [`${modelName}ById`]: typeComposer.getResolver('findById'),
            [`${modelName}ByIds`]: typeComposer.getResolver('findByIds'),
            [`${modelName}One`]: typeComposer.getResolver('findOne'),
            [`${modelName}Many`]: typeComposer.getResolver('findMany'),
            [`${modelName}Count`]: typeComposer.getResolver('count'),
            [`${modelName}Connection`]: typeComposer.getResolver('connection'),
            [`${modelName}Pagination`]: typeComposer.getResolver('pagination')
          });

          schemaComposer.Mutation.addFields({
            [`${modelName}CreateOne`]: typeComposer.getResolver('createOne'),
            [`${modelName}CreateMany`]: typeComposer.getResolver('createMany'),
            [`${modelName}UpdateById`]: typeComposer.getResolver('updateById'),
            [`${modelName}UpdateOne`]: typeComposer.getResolver('updateOne'),
            [`${modelName}UpdateMany`]: typeComposer.getResolver('updateMany'),
            [`${modelName}RemoveById`]: typeComposer.getResolver('removeById'),
            [`${modelName}RemoveOne`]: typeComposer.getResolver('removeOne'),
            [`${modelName}RemoveMany`]: typeComposer.getResolver('removeMany')
          });
          logger.debug(`Generated graphql schema for ${modelName}`);
        }
      })
    );
    graphqlSchema = schemaComposer.buildSchema();
  } catch (err) {
    logger.error(err);
  }
  return graphqlSchema;
};

export default getGraphQLSchema;
