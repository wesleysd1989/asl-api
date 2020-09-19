import { differenceInYears, isToday } from 'date-fns';

import Employees from '../models/Employees';
import Event from '../models/Event';
import Image from '../models/Image';
import Mail from '../../lib/Mail';

const sendEmailHappybirthday = async dataToSend => {
    await Mail.sendMail({
        to: `${dataToSend.full_name} <${dataToSend.email}>`,
        subject: dataToSend.eventName,
        template: 'happybirthday',
        context: {
            user: dataToSend.full_name,
            link: dataToSend.link,
        },
    });
};

const sendEmailCommemorative = async dataToSend => {
    await Mail.sendMail({
        to: `${dataToSend.full_name} <${dataToSend.email}>`,
        subject: dataToSend.eventName,
        template: 'commemorative',
        context: {
            user: dataToSend.full_name,
            link: dataToSend.link,
        },
    });
};

class SendEvent {
    get key() {
        return 'SendEvent';
    }

    get options() {
        return { repeat: { cron: '0 0 * * *' } };
    }

    async handle() {
        const events = await Event.findAll({
            where: {
                status: 'ACTIVE',
            },
        });
        events.map(async event => {
            const employees = await Employees.findAll({
                where: {
                    events_id: event.dataValues.id,
                    status: 'WAITING',
                    deleted: false,
                },
            });
            if (employees.length === 0) {
                await Event.update(
                    { status: 'FINISHED' },
                    { where: { id: event.dataValues.id } }
                );
            }
            employees.map(async employee => {
                const image = await Image.findByPk(event.dataValues.image_id);
                if (event.dataValues.type === 'BIRTHDAY') {
                    const result = differenceInYears(
                        new Date(),
                        employee.dataValues.date_to_send
                    );
                    if (result > 0) {
                        sendEmailCommemorative({
                            full_name: employee.dataValues.full_name,
                            email: employee.dataValues.email,
                            eventName: event.dataValues.name,
                            link: `${process.env.APP_URL}/files/${image.dataValues.path}`,
                        });
                        await Employees.update(
                            { status: 'SENT' },
                            { where: { id: employee.dataValues.id } }
                        );
                    }
                } else if (isToday(employee.dataValues.date_to_send)) {
                    sendEmailHappybirthday({
                        full_name: employee.dataValues.full_name,
                        email: employee.dataValues.email,
                        eventName: event.dataValues.name,
                        link: `${process.env.APP_URL}/files/${image.dataValues.path}`,
                    });
                    await Employees.update(
                        { status: 'SENT' },
                        { where: { id: employee.dataValues.id } }
                    );
                }
                return true;
            });
            return true;
        });
    }
}

export default new SendEvent();
