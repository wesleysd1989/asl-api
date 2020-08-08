import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import Account from '../models/Account';
import authConfig from '../../config/auth';
import User from '../models/User';

class AccountController {
    async show(req, res) {
        const { token } = req.params;
        try {
            const decoded = await promisify(jwt.verify)(
                token,
                authConfig.secret
            );
            if (!decoded.confirme || decoded.recovery) {
                return res.status(400).json({ error: 'Token invalid' });
            }
            const account = await Account.findByPk(decoded.id);
            if (!account.dataValues.activeted) {
                const updatedAccount = { activeted: true };
                await account.update(updatedAccount);
                return res.json({
                    message: 'Account successfully confirmed.',
                });
            }
            return res.json({
                message: 'Account has already been successfully confirmed.',
            });
        } catch (err) {
            return res.status(400).json({ error: 'Token invalid' });
        }
    }

    async update(req, res) {
        const { id } = req.params;
        if (req.accountId === parseInt(id, 0)) {
            return res
                .status(400)
                .json({ error: 'You cannot block your own account.' });
        }
        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
        }

        const user = await User.findOne({
            where: { account_id: req.accountId },
        });
        if (user.dataValues.type > 1) {
            return res
                .status(400)
                .json({ error: 'You do not have permission.' });
        }
        const account = await Account.findByPk(id);

        const updatedClient = {
            blocked: !account.dataValues.blocked,
        };
        await account.update(updatedClient);

        if (account.dataValues.blocked) {
            return res
                .status(200)
                .json({ message: 'Account blocked successfully.' });
        }
        return res
            .status(200)
            .json({ message: 'Account successfully unlocked.' });
    }

    async delete(req, res) {
        const { id } = req.params;
        if (req.accountId === parseInt(id, 0)) {
            return res
                .status(400)
                .json({ error: 'You cannot delete your own account.' });
        }
        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
        }

        const user = await User.findOne({
            where: { account_id: req.accountId },
        });
        if (user.dataValues.type > 1) {
            return res
                .status(400)
                .json({ error: 'You do not have permission.' });
        }
        const account = await Account.findByPk(id);

        const updatedClient = {
            deleted: true,
        };
        await account.update(updatedClient);

        return res
            .status(200)
            .json({ message: 'Account deleted successfully.' });
    }
}

export default new AccountController();
