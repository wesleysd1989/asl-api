import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import Account from '../models/Account';
import User from '../models/User';
import File from '../models/File';
import authConfig from '../../config/auth';
import LoginMail from '../jobs/LoginMail';
import Queue from '../../lib/Queue';

class UserSessionController {
    async store(req, res) {
        const schema = Yup.object().shape({
            email: Yup.string()
                .email()
                .required(),
            password: Yup.string().required(),
        });
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        const { email, password } = req.body;
        const account = await Account.findOne({
            where: { email },
        });
        if (!account) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (!(await account.checkPassword(password))) {
            return res.status(401).json({ error: 'Password does not match' });
        }
        if (!account.dataValues.activeted) {
            return res
                .status(403)
                .json({ error: 'Please confirm your account.' });
        }
        if (account.dataValues.group !== 1) {
            return res.status(403).json({ error: 'Account is not a user' });
        }

        if (account.dataValues.blocked) {
            return res.status(403).json({
                error:
                    'Your account has blocked, check your email to more information.',
            });
        }
        if (account.dataValues.deleted) {
            return res.status(403).json({
                error:
                    'Your account has deleted, check your email to more information.',
            });
        }

        const { id } = account;
        const {
            name,
            avatar_id,
            phone,
            birth,
            type,
            avatar,
        } = await User.findOne({
            where: { account_id: id },
            include: [
                {
                    model: File,
                    as: 'avatar',
                    attributes: ['id', 'path', 'url'],
                },
            ],
        });
        const sendData = { ...account.dataValues, name };
        await Queue.add(LoginMail.key, {
            name: sendData.name,
            email: sendData.email,
            last_login: sendData.last_login,
            createdAt: sendData.createdAt,
        });
        return res.json({
            user: {
                id,
                name,
                email,
                phone,
                birth,
                type,
                avatar_id,
                avatar,
            },
            token: jwt.sign(
                { id, confirme: false, recovery: false },
                authConfig.secret,
                {
                    expiresIn: authConfig.expiresIn,
                }
            ),
        });
    }
}

export default new UserSessionController();
