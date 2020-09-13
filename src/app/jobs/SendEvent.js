import { differenceInYears, isToday } from 'date-fns';

import Employees from '../models/Employees';
import Event from '../models/Event';
import Mail from '../../lib/Mail';

const sendEmail = async dataToSend => {
    await Mail.sendMail({
        to: `${dataToSend.full_name} <${dataToSend.email}>`,
        subject: dataToSend.eventName,
        template: 'login',
        context: {
            user: dataToSend.full_name,
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
            employees.map(async employee => {
                if (event.dataValues.type === 'BIRTHDAY') {
                    const result = differenceInYears(
                        new Date(),
                        employee.dataValues.date_to_send
                    );
                    if (result > 0) {
                        sendEmail({
                            full_name: employee.dataValues.full_name,
                            email: employee.dataValues.email,
                            eventName: event.dataValues.name,
                        });
                        await Employees.update(
                            { status: 'SENT' },
                            { where: { id: employee.dataValues.id } }
                        );
                    }
                } else if (isToday(employee.dataValues.date_to_send)) {
                    sendEmail({
                        full_name: employee.dataValues.full_name,
                        email: employee.dataValues.email,
                        eventName: event.dataValues.name,
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
