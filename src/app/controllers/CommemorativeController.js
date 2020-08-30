import { Op, where, fn, col } from 'sequelize';
import * as Yup from 'yup';

import Commemorative from '../models/Commemorative';
import Image from '../models/Image';

class CommemorativeController {
    async index(req, res) {
        const { page = 1, search = '', qtdPage = 10 } = req.query;
        const qtdPages = await Commemorative.count({
            where: {
                [Op.and]: [
                    where(fn('lower', col('name')), {
                        [Op.like]: `%${search.toLowerCase()}%`,
                    }),
                    where(col('deleted'), false),
                ],
            },
        });
        const commemoratives = await Commemorative.findAll({
            where: {
                [Op.and]: [
                    where(fn('lower', col('name')), {
                        [Op.like]: `%${search.toLowerCase()}%`,
                    }),
                    where(col('deleted'), false),
                ],
            },
            order: ['id'],
            limit: qtdPage,
            offset: (page - 1) * qtdPage,
            attributes: ['id', 'name', 'description'],
            include: [
                {
                    model: Image,
                    as: 'image',
                    attributes: ['id', 'path', 'url'],
                },
            ],
        });
        return res.status(200).json({
            qtdPages: Math.ceil(qtdPages / qtdPage),
            total: qtdPages,
            commemoratives,
        });
    }

    async show(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
        }

        const commemorative = await Commemorative.findOne({
            where: { deleted: false, id },
            attributes: ['id', 'name', 'description'],
            include: [
                {
                    model: Image,
                    as: 'image',
                    attributes: ['id', 'path', 'url'],
                },
            ],
        });

        if (!commemorative) {
            return res.status(400).json({ error: 'Commemorative not exists.' });
        }

        return res.status(200).json({ commemorative });
    }

    async store(req, res) {
        const images = req.files;
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            description: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }
        const commemorativeRequest = {
            name: req.body.name,
            description: req.body.description,
        };
        const { id, name, description } = await Commemorative.create(
            commemorativeRequest
        );

        if (images) {
            images.map(async image => {
                const { originalname: nameFile, filename: path } = image;
                const imagesRequest = {
                    name: nameFile,
                    path,
                    commemorative_id: id,
                };
                await Image.create(imagesRequest);
            });
        }

        return res.status(201).json({ id, name, description });
    }

    async update(req, res) {
        const { id } = req.params;
        const images = req.files;
        const schema = Yup.object().shape({
            name: Yup.string(),
            description: Yup.string(),
            excluded_images: Yup.string(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
        }

        const commemorative = await Commemorative.findOne({
            where: { id },
        });

        const updatedCommemorative = {
            name: req.body.name || commemorative.name,
            description: req.body.description || commemorative.description,
        };
        await commemorative.update(updatedCommemorative);

        if (images) {
            images.map(async image => {
                const { originalname: nameFile, filename: path } = image;
                const imagesRequest = {
                    name: nameFile,
                    path,
                    commemorative_id: id,
                };
                await Image.create(imagesRequest);
            });
        }

        if (req.body.excluded_images) {
            const idsImages = req.body.excluded_images.split(',');
            idsImages.map(async idImage => {
                await Image.destroy({ where: { id: idImage } });
            });
        }

        return res
            .status(200)
            .json({ message: 'Commemorative updated successfully.' });
    }

    async delete(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
        }

        const commemorative = await Commemorative.findOne({
            where: { id },
        });

        const updatedCommemorative = {
            deleted: true,
        };
        await commemorative.update(updatedCommemorative);

        return res
            .status(200)
            .json({ message: 'Commemorative deleted successfully.' });
    }
}

export default new CommemorativeController();
