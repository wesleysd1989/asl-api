import { Op, where, fn, col } from 'sequelize';
import * as Yup from 'yup';

import Event from '../models/Event';
import Commemorative from '../models/Commemorative';
import Image from '../models/Image';
import CreateEvent from '../jobs/CreateEvent';
import Queue from '../../lib/Queue';

class EventController {
    async index(req, res) {
        const { page = 1, search = '', qtdPage = 10 } = req.query;
        const qtdPages = await Event.count({
            where: {
                [Op.and]: [
                    where(fn('lower', col('Event.name')), {
                        [Op.like]: `%${search.toLowerCase()}%`,
                    }),
                    where(col('status'), {
                        [Op.not]: 'DELETED',
                    }),
                ],
            },
        });
        const events = await Event.findAll({
            order: ['status', 'created_at'],
            where: {
                [Op.and]: [
                    where(fn('lower', col('Event.name')), {
                        [Op.like]: `%${search.toLowerCase()}%`,
                    }),
                    where(col('status'), {
                        [Op.not]: 'DELETED',
                    }),
                ],
            },
            attributes: ['id', 'name', 'status'],
            limit: qtdPage,
            offset: (page - 1) * qtdPage,
            include: [
                {
                    model: Commemorative,
                    as: 'commemorative',
                    attributes: ['id', 'name', 'description'],
                },
                {
                    model: Image,
                    as: 'image',
                    attributes: ['id', 'path', 'url'],
                },
            ],
        });

        return res.json({
            qtdPages: Math.ceil(qtdPages / qtdPage),
            total: qtdPages,
            events,
        });
    }

    async show(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
        }

        const event = await Event.findOne({
            where: {
                id,
            },
            include: [
                {
                    model: Image,
                    as: 'image',
                    attributes: ['id', 'path', 'url'],
                },
            ],
        });

        if (!event) {
            return res.status(400).json({ error: 'Event not exists.' });
        }

        const { commemorative_id } = event;
        const commemorative = await Commemorative.findOne({
            where: { deleted: false, id: commemorative_id },
            attributes: ['id', 'name', 'description'],
            include: [
                {
                    model: Image,
                    as: 'image',
                    attributes: ['id', 'path', 'url'],
                },
            ],
        });

        return res.status(200).json({ event, commemorative });
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            commemorative_id: Yup.number().required(),
            image_id: Yup.number().required(),
            employees: Yup.array().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const eventRequest = {
            name: req.body.name,
            commemorative_id: req.body.commemorative_id,
            image_id: req.body.image_id,
        };
        const { id, name } = await Event.create(eventRequest);

        const sendData = { employees: req.body.employees, id };
        await Queue.add(CreateEvent.key, sendData);
        return res.status(201).json({ id, name });
    }

    async update(req, res) {
        const { id } = req.params;
        const schema = Yup.object().shape({
            name: Yup.string(),
            commemorative_id: Yup.number(),
            image_id: Yup.number(),
            status: Yup.string(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
        }

        const event = await Event.findOne({
            where: { id },
        });

        if (event.status === 'FINISHED' || event.status === 'ACTIVE') {
            return res.status(400).json({
                error:
                    'It is not possible to change information about an ongoing or completed event.',
            });
        }

        const updatedEvent = {
            name: req.body.name || event.name,
            commemorative_id:
                req.body.commemorative_id || event.commemorative_id,
            image_id: req.body.image_id || event.image_id,
            status: req.body.status || event.status,
        };
        await event.update(updatedEvent);
        return res.status(200).json({ message: 'Event updated successfully.' });
    }

    async delete(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
        }

        const event = await Event.findOne({
            where: { id },
        });

        if (event.status === 'FINISHED' || event.status === 'ACTIVE') {
            return res.status(400).json({
                error:
                    'It is not possible to delete event ongoing or completed.',
            });
        }

        const updatedEvent = {
            status: 'DELETED',
        };
        await event.update(updatedEvent);

        return res.status(200).json({ message: 'Event deleted successfully.' });
    }
}

export default new EventController();
