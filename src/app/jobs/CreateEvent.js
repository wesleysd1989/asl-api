import Employees from '../models/Employees';

class CreateEvent {
    get key() {
        return 'CreateEvent';
    }

    async handle({ data }) {
        const event = data;
        const insertEmployees = async employee => {
            await Employees.create(employee);
        };
        event.employees.map(employee => {
            const employeeData = {
                events_id: event.id,
                full_name: employee.full_name,
                email: employee.email,
                date_to_send: employee.date,
            };
            insertEmployees(employeeData);
        });
    }
}

export default new CreateEvent();
