import Sequelize from 'sequelize';

import Account from '../app/models/Account';
import Client from '../app/models/Client';
import File from '../app/models/File';
import User from '../app/models/User';
import Commemorative from '../app/models/Commemorative';
import Image from '../app/models/Image';
import Event from '../app/models/Event';
import Employees from '../app/models/Employees';

import databaseConfig from '../config/database';

const models = [
    Account,
    Client,
    File,
    User,
    Commemorative,
    Image,
    Event,
    Employees,
];

class Database {
    constructor() {
        this.init();
    }

    init() {
        this.connection = new Sequelize(databaseConfig);
        models
            .map(model => model.init(this.connection))
            .map(
                model =>
                    model.associate && model.associate(this.connection.models)
            );
    }
}

export default new Database();
