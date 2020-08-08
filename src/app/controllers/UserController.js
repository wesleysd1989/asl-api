import { Op, where, fn, col } from 'sequelize';
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import Account from '../models/Account';
import User from '../models/User';
import File from '../models/File';
import authConfig from '../../config/auth';
import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

class UserController {
    async index(req, res) {
        const { page = 1, searchEmail = '', qtdPage = 10 } = req.query;
        const qtdPages = await User.count({
            include: [
                {
                    model: Account,
                    as: 'account',
                    where: {
                        [Op.and]: [
                            where(fn('lower', col('account.email')), {
                                [Op.like]: `%${searchEmail.toLowerCase()}%`,
                            }),
                            where(col('deleted'), false),
                        ],
                    },
                },
            ],
        });
        const users = await User.findAll({
            order: ['created_at'],
            attributes: ['id', 'name', 'birth', 'type'],
            limit: qtdPage,
            offset: (page - 1) * qtdPage,
            include: [
                {
                    model: File,
                    as: 'avatar',
                    attributes: ['id', 'path', 'url'],
                },
                {
                    model: Account,
                    as: 'account',
                    where: {
                        [Op.and]: [
                            where(fn('lower', col('account.email')), {
                                [Op.like]: `%${searchEmail.toLowerCase()}%`,
                            }),
                            where(col('deleted'), false),
                        ],
                    },
                    attributes: [
                        'id',
                        'email',
                        'activeted',
                        'blocked',
                        'deleted',
                    ],
                },
            ],
        });

        return res.json({
            qtdPages: Math.ceil(qtdPages / qtdPage),
            total: qtdPages,
            users,
        });
    }

    async show(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
        }

        const user = await User.findOne({
            where: { id },
            attributes: ['id', 'name', 'phone', 'type', 'birth'],
            include: [
                {
                    model: File,
                    as: 'avatar',
                    attributes: ['id', 'path', 'url'],
                },
                {
                    model: Account,
                    as: 'account',
                    attributes: ['id', 'email'],
                },
            ],
        });

        if (req.accountId === user.account.id) {
            return res.status(400).json({
                error: 'It is not possible to request your own information.',
            });
        }

        const account = await Account.findOne({
            where: { deleted: false, id: user.account.id },
        });

        if (!account) {
            return res.status(400).json({ error: 'Account not exists.' });
        }

        if (!user) {
            return res.status(400).json({ error: 'Client not exists.' });
        }

        return res.status(200).json({ user });
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            phone: Yup.string().required(),
            type: Yup.number().required(),
            birth: Yup.string().required(),
            email: Yup.string()
                .email()
                .required(),
            password: Yup.string()
                .required()
                .min(6),
        });
        const date = new Date();

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const accountExists = await Account.findOne({
            where: { email: req.body.email },
        });

        if (accountExists) {
            return res.status(400).json({ error: 'Account already exists.' });
        }

        const accountRequest = {
            email: req.body.email,
            password: req.body.password,
            group: 1,
            last_login: date,
        };
        const { id, email } = await Account.create(accountRequest);

        const userRequest = {
            name: req.body.name,
            phone: req.body.phone,
            type: req.body.type,
            birth: req.body.birth,
            account_id: id,
        };
        const { name } = await User.create(userRequest);
        const token = jwt.sign(
            { id, confirme: true, recovery: false },
            authConfig.secret,
            {
                expiresIn: authConfig.expiresIn,
            }
        );
        const sendData = {
            email,
            name,
            link: `${process.env.FRONTEND_URL}/confirme/${token}`,
        };
        await Queue.add(RegistrationMail.key, {
            sendData,
        });
        return res.status(201).json({
            id,
            name,
            email,
        });
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            phone: Yup.string(),
            birth: Yup.date(),
            avatar_id: Yup.number(),
            // o codigo a baixo torna o oldPassword obrigatorio de forma dinamica.
            // .when('oldPassword', (oldPassword, field) => oldPassword ? field.required() : field)
            password: Yup.string().min(6),
            confirmPassword: Yup.string().when('password', (password, field) =>
                password ? field.required().oneOf([Yup.ref('password')]) : field
            ),
            oldPassword: Yup.string()
                .min(6)
                .required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const user = await User.findOne(
            {
                where: { account_id: req.accountId },
            },
            {
                include: [
                    {
                        model: File,
                        as: 'avatar',
                        attributes: ['name', 'path', 'url'],
                    },
                ],
            }
        );

        const { oldPassword } = req.body;

        const account = await Account.findByPk(req.accountId);
        if (!(await account.checkPassword(oldPassword))) {
            return res.status(401).json({ error: 'Password does not match' });
        }
        const updatedAccount = {
            password: req.body.password || oldPassword,
        };
        const updatedUser = {
            name: req.body.name || user.name,
            phone: req.body.phone || user.phone,
            birth: req.body.birth || user.birth,
            avatar_id: req.body.avatar_id || user.avatar_id,
        };
        const { id, email } = await account.update(updatedAccount);
        await user.update(updatedUser);
        const { name, phone, birth, type, avatar } = await User.findOne({
            where: { account_id: req.accountId },
            include: [
                {
                    model: File,
                    as: 'avatar',
                    attributes: ['name', 'path', 'url'],
                },
            ],
        });

        return res.json({ id, email, name, phone, birth, type, avatar });
    }
}

export default new UserController();
