import Realm from 'realm';

export default class ReduxPersistRealmStorageEngine {
  constructor(config, modelName) {
    this.config = config;
    this.modelName = modelName;
    this.model = Array.prototype.find.call(
        this.config.schema,
        (model) => {
          return model.schema.name === this.modelName;
        },
    );

    this.validateSchema();

    this.realm = new Realm(config);
    this.items = this.realm.objects(this.modelName);
  }

  validateSchema() {
    if (this.model === undefined) {
      throw new Error(`A model '${this.modelName}' is missing in provided config`);
    }

    const { properties: { name, content } } = this.model.schema;

    if (name !== 'string' || content !== 'string') {
      throw new Error(`A model should contain this fields: 'name' and 'content' with type 'string'`);
    }
  }

  async getItem(key) {
    const matches = this.items.filtered(`name == "${key}"`);
    if (matches.length > 0 && matches[0]) {
      return matches[0].content;
    } else {
      throw new Error(`Could not get item with key: '${key}'`);
    }
  };

  async setItem(key, value) {
    let exists;
    try { // update if exists
      await this.getItem(key);
      exists = true;
    } catch (error) {
      exists = false;
    }

    this.realm.write(() => {
      if (exists) {
        this.realm.create(this.modelName, { name: key, content: value }, true);
      } else {
        this.realm.create(this.modelName, { name: key, content: value });
      }
    });
  };

  async removeItem(key) {
    this.realm.write(() => {
      const item = this.items.filtered(`name = "${key}"`);
      this.realm.delete(item);
    });
  };

  async getAllKeys() {
    return this.items.map((item) => item.name);
  };
}
