import Account from '../models/Account';

export default async (req, res, next) => {
    const account = await Account.findByPk(req.accountId);
    if (account.dataValues.group !== 1) {
        return res.status(401).json({ error: 'Account is not a user' });
    }
    return next();
};
