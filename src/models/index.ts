import * as fs from 'fs';
import * as path from 'path';
import { Sequelize } from 'sequelize';
import { DBConnection } from '../interfaces/BDConnectionInterface';
import { databases } from '../config/config';

const basename: string = path.basename(module.filename);
//process.env.NODE_ENV.trim() ||
const env: string = 'development';
let config = JSON.parse(databases);
config = config[env]

let db = null;

if (!db) {
    db = {};

    const operatorsAliases = false;

    config = Object.assign({ operatorsAliases }, config)

    const sequelize: Sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );

    fs.readdirSync(__dirname)
        .filter((file: string) => {
            return (file.indexOf('.') !== 0) && (file !== basename)
        }).forEach((file: string) => {
            const model = sequelize.import(path.join(__dirname, file));
            db[model['name']] = model;
        });

    Object.keys(db).forEach((modelName: string) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db['sequelize'] = sequelize;


}

export default <DBConnection>db;

