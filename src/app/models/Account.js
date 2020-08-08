import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Account extends Model {
    static init(sequelize) {
        super.init(
            {
                email: Sequelize.STRING,
                password: Sequelize.VIRTUAL,
                password_hash: Sequelize.STRING,
                activeted: Sequelize.BOOLEAN,
                group: Sequelize.INTEGER,
                social: Sequelize.BOOLEAN,
                blocked: Sequelize.BOOLEAN,
                deleted: Sequelize.BOOLEAN,
                recovery: Sequelize.BOOLEAN,
                last_login: Sequelize.DATE,
            },
            {
                sequelize,
            }
        );

        this.addHook('beforeSave', async account => {
            if (account.password) {
                account.password_hash = await bcrypt.hash(account.password, 8);
            }
        });

        return this;
    }

    checkPassword(password) {
        return bcrypt.compare(password, this.password_hash);
    }
}

export default Account;
