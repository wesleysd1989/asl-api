import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import * as Yup from 'yup';

import Account from '../models/Account';
import Client from '../models/Client';
import User from '../models/User';
import authConfig from '../../config/auth';
import Queue from '../../lib/Queue';
import RecoveryAccountMail from '../jobs/RecoveryAccountMail';

class RecoveryAccountController {
    async update(req, res) {
        const { token } = req.params;
        try {
            const schema = Yup.object().shape({
                password: Yup.string()
                    .required()
                    .min(6),
                confirmPassword: Yup.string().oneOf([
                    Yup.ref('password'),
                    null,
                ]),
            });
            if (!(await schema.isValid(req.body))) {
                return res.status(400).json({ error: 'Validation fails' });
            }
            const decoded = await promisify(jwt.verify)(
                token,
                authConfig.secret
            );
            if (!decoded.recovery || decoded.confirme) {
                return res.status(400).json({ error: 'Token invalid' });
            }
            const account = await Account.findByPk(decoded.id);
            if (account.dataValues.recovery) {
                const updatedAccount = {
                    password: req.body.password,
                    recovery: false,
                };
                await account.update(updatedAccount);
                return res.status(200).json({
                    message: 'Account successfully recovered.',
                });
            }
            return res
                .status(400)
                .json({ error: 'Unable to recover password, try again.' });
        } catch (err) {
            return res.status(400).json({ error: 'Token invalid' });
        }
    }

    async store(req, res) {
        const schema = Yup.object().shape({
            email: Yup.string()
                .email()
                .required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'E-mail is required' });
        }

        const account = await Account.findOne({
            where: { email: req.body.email },
        });

        if (!account) {
            return res.status(400).json({ error: 'Account not exists.' });
        }

        const token = jwt.sign(
            { id: account.id, confirme: false, recovery: true },
            authConfig.secret,
            {
                expiresIn: '1d',
            }
        );
        let name;
        if (account.group !== 1) {
            const client = await Client.findOne({
                where: { account_id: account.id },
            });
            name = client.name;
        } else {
            const user = await User.findOne({
                where: { account_id: account.id },
            });
            name = user.name;
        }

        const updatedAccount = { recovery: true };
        await account.update(updatedAccount);

        const sendData = {
            email: account.email,
            name,
            link: `${process.env.FRONTEND_URL}/recovery/${token}`,
        };
        await Queue.add(RecoveryAccountMail.key, {
            sendData,
        });
        return res.status(200).json({
            message: 'Please verify your email to continue recovery step.',
        });
    }
}

export default new RecoveryAccountController();
