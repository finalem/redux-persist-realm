import ReduxPersistRealmStorageEngine from './ReduxPersistRealmStorageEngine';

export default function createStorageEngine(config, modelName) {
  return new ReduxPersistRealmStorageEngine(config, modelName);
}
