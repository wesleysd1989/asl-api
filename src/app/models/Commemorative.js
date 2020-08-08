import Sequelize, { Model } from 'sequelize';

class Commemorative extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                description: Sequelize.STRING,
                deleted: Sequelize.BOOLEAN,
            },
            {
                sequelize,
            }
        );

        return this;
    }

    static associate(models) {
        this.hasMany(models.Image, {
            as: 'image',
            foreignKey: 'commemorative_id',
        });
    }
}

export default Commemorative;
