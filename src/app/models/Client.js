import Sequelize, { Model } from 'sequelize';

class Client extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                balance: Sequelize.INTEGER,
                birth: Sequelize.DATE,
                account_id: Sequelize.INTEGER,
            },
            {
                sequelize,
            }
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
        this.belongsTo(models.Account, {
            foreignKey: 'account_id',
            as: 'account',
        });
    }
}

export default Client;
