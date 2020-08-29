import Sequelize, { Model } from 'sequelize';

class Employees extends Model {
    static init(sequelize) {
        super.init(
            {
                full_name: Sequelize.STRING,
                email: Sequelize.STRING,
                events_id: Sequelize.INTEGER,
                status: Sequelize.ENUM(['SENT', 'WAITING']),
                deleted: Sequelize.BOOLEAN,
                date_to_send: Sequelize.DATE,
            },
            {
                sequelize,
            }
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.Event, {
            foreignKey: 'events_id',
            as: 'event',
        });
    }
}

export default Employees;
