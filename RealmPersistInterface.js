import Realm from 'realm';

class RealmPersistInterface {
    constructor() {
        this.realm = new Realm({
            schema: [{
                name: 'Item',
                primaryKey: 'name',
                properties: {
                    name: 'string',
                    content: 'string',
                },
            }],
        });

        this.items = this.realm.objects('Item');
    }

    getItem = key => new Promise((resolve, reject) => {
        try {
            const matches = this.items.filtered(`name = "${key}"`);

            if (matches.length > 0 && matches[0]) {
                resolve(matches[0].content);
            } else {
                throw new Error(`Could not get item with key: '${key}'`);
            }
        } catch (error) {
            reject(error);
        }
    });

    setItem = (key, value) => new Promise((resolve, reject) => {
        try {
            this.getItem(key, (error) => {
                this.realm.write(() => {
                    if (error) {
                        this.realm.create(
                            'Item',
                            {
                                name: key,
                                content: value,
                            }
                        );
                    } else {
                        this.realm.create(
                            'Item',
                            {
                                name: key,
                                content: value,
                            },
                            true
                        );
                    }

                    resolve();
                });
            });
        } catch (error) {
            reject(error);
        }
    });

    removeItem = key => new Promise((resolve, reject) => {
        try {
            this.realm.write(() => {
                const item = this.items.filtered(`name = "${key}"`);

                this.realm.delete(item);

                resolve();
            });
        } catch (error) {
            reject(error);
        }
    });

    getAllKeys = () => new Promise((resolve, reject) => {
        try {
            const keys = this.items.map(
                (item) => item.name
            );

            resolve(keys);
        } catch (error) {
            reject(error);
        }
    });
}

const singleton = new RealmPersistInterface();

export default singleton;
