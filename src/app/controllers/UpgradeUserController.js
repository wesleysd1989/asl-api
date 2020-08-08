import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';

class UpgradeUserController {
    async update(req, res) {
        const { id } = req.params;
        const schema = Yup.object().shape({
            type: Yup.number(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        if (!id) {
            return res.status(400).json({ error: 'Id is required' });
        }

        const user = await User.findOne(
            {
                where: { id },
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
        if (req.accountId === parseInt(id, 2)) {
            return res
                .status(400)
                .json({ error: 'You cannot update your own account..' });
        }
        if (!user) {
            return res.status(400).json({ error: 'User does not exist.' });
        }
        const updatedUser = {
            type: req.body.type || user.type,
        };
        await user.update(updatedUser);

        return res.status(200).json({ message: 'User updated successfully.' });
    }
}

export default new UpgradeUserController();
