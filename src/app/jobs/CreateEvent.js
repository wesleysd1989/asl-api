import Employees from '../models/Employees';

class CreateEvent {
    get key() {
        return 'CreateEvent';
    }

    async handle({ data }) {
        const event = data;

        for (let i = 1; i <= event.employees.length; i += 1) {
            const insertEmployees = async employee => {
                await Employees.create(employee);
            };
            const employee = {
                events_id: event.id,
                full_name: event.employees[i].full_name,
                email: event.employees[i].email,
                date_to_send: event.employees[i].date,
            };
            insertEmployees(employee);
        }
    }
}

export default new CreateEvent();
