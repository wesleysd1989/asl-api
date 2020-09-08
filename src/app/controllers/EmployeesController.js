import { Op, where, col, fn } from 'sequelize';

import Employees from '../models/Employees';
import Event from '../models/Event';

class EmployeesController {
    async show(req, res) {
        const { id } = req.params;
        const { page = 1, search = '', qtdPage = 10 } = req.query;
        const qtdPages = await Employees.count({
            where: {
                events_id: id,
                [Op.and]: [
                    where(fn('lower', col('email')), {
                        [Op.like]: `%${search.toLowerCase()}%`,
                    }),
                    where(col('deleted'), false),
                ],
            },
        });
        const employees = await Employees.findAll({
            where: {
                events_id: id,
                [Op.and]: [
                    where(fn('lower', col('email')), {
                        [Op.like]: `%${search.toLowerCase()}%`,
                    }),
                    where(col('deleted'), false),
                ],
            },
            order: ['id'],
            limit: qtdPage,
            offset: (page - 1) * qtdPage,
            include: [
                {
                    model: Event,
                    as: 'event',
                    attributes: ['id', 'name'],
                },
            ],
        });

        return res.json({
            qtdPages: Math.ceil(qtdPages / qtdPage),
            total: qtdPages,
            employees,
        });
    }

    async delete(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
        }

        const commemorative = await Employees.findOne({
            where: { id },
        });

        const updatedCommemorative = {
            deleted: true,
        };
        await commemorative.update(updatedCommemorative);

        return res
            .status(200)
            .json({ message: 'Employee deleted successfully.' });
    }
}

export default new EmployeesController();
