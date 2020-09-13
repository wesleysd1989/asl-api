import Sequelize, { Model } from 'sequelize';

class Event extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                commemorative_id: Sequelize.INTEGER,
                image_id: Sequelize.INTEGER,
                status: Sequelize.ENUM([
                    'ACTIVE',
                    'PENDING',
                    'FINISHED',
                    'BLOCKED',
                    'DELETED',
                ]),
                type: Sequelize.ENUM(['BIRTHDAY', 'SEND']),
            },
            {
                sequelize,
            }
        );

        return this;
    }

    static associate(models) {
        this.belongsTo(models.Commemorative, {
            foreignKey: 'commemorative_id',
            as: 'commemorative',
        });
        this.belongsTo(models.Image, {
            foreignKey: 'image_id',
            as: 'image',
        });
    }
}

export default Event;
