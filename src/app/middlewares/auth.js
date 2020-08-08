import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import Account from '../models/Account';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token not provided' });
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = await promisify(jwt.verify)(token, authConfig.secret);
        if (decoded.confirme || decoded.recovery) {
            return res.status(401).json({ error: 'Token invalid' });
        }
        req.accountId = decoded.id;
        const account = await Account.findByPk(decoded.id);
        if (!account.dataValues.activeted) {
            return res
                .status(403)
                .json({ message: 'Please confirm your account.' });
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

        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Token invalid' });
    }
};
