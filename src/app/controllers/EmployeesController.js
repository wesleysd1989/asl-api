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
}

export default new EmployeesController();
