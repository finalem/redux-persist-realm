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

    getItem(key, callback) {
        try {
            const matches = this.items.filtered(`name = "${key}"`);

            if (matches.length > 0 && matches[0]) {
                callback(null, matches[0].content);
            } else {
                throw new Error(`Could not get item with key: '${key}'`);
            }
        } catch (error) {
            callback(error);
        }
    };

    setItem(key, value, callback) {
        try {
            this.getItem(key, (error) => {
                this.realm.write(() => {
                    if (error) {
                        this.realm.create(
                            this.modelName,
                            {
                                name: key,
                                content: value,
                            }
                        );
                    } else {
                        this.realm.create(
                            this.modelName,
                            {
                                name: key,
                                content: value,
                            },
                            true
                        );
                    }

                    callback();
                });
            });
        } catch (error) {
            callback(error);
        }
    };

    removeItem(key, callback) {
        try {
            this.realm.write(() => {
                const item = this.items.filtered(`name = "${key}"`);

                this.realm.delete(item);
            });
        } catch (error) {
            callback(error);
        }
    };

    getAllKeys(callback) {
        try {
            const keys = this.items.map(
                (item) => item.name
            );

            callback(null, keys);
        } catch (error) {
            callback(error);
        }
    };
}
