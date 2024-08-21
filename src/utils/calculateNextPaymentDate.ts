import moment from 'moment'

export function calculateNextPaymentDate(duration: number, installments: number, lastPaymentDate?: string) {
    // If lastPaymentDate is provided, use it; otherwise, use today's date
    const startDate = lastPaymentDate ? moment(lastPaymentDate) : moment();

    const totalMonths = duration;

    // Calculate the interval between payments
    const intervalMonths = totalMonths / (installments - 1); // 1.75 months or 1 month and 21 days

    // Calculate the next payment date
    const nextPaymentDate = startDate.add(intervalMonths, 'months');

    console.log('Next Payment Date:', nextPaymentDate.format('YYYY-MM-DD'));

    return nextPaymentDate.format('YYYY-MM-DD');
}
