'use strict';

class DatePicker {
    constructor(id, callback) {
        this.id = id;
        this.callback = callback;
        this.element = document.getElementById(id);

        if (!this.element) {
            throw new Error(`ID "${id}" element is not found.`);
        }
    }

    render(date) {
        this.currentDate = new Date(date);
        this.element.innerHTML = '';
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
        const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        const container = document.createElement('div');
        container.className = 'datepicker-container';

        const header = document.createElement('div');
        header.className = 'datepicker-header';

        // Previous month button
        const prevButton = document.createElement('button');
        prevButton.textContent = '<';
        prevButton.onclick = () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render(this.currentDate);
        };

        // Next month button
        const nextButton = document.createElement('button');
        nextButton.textContent = '>';
        nextButton.onclick = () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render(this.currentDate);
        };

        // Current month/year label
        const currentMonthLabel = document.createElement('span');
        currentMonthLabel.textContent = `${monthNames[month]} ${year}`;

        header.appendChild(prevButton);
        header.appendChild(currentMonthLabel);
        header.appendChild(nextButton);
        // Adding the header to container as first child
        container.appendChild(header);

        const table = document.createElement('table');
        table.className = 'datepicker-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        dayNames.forEach((day) => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        // Get the first day of the month in day format (0 Sunday .... 6 Saturday)
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const dateIterator = new Date(year, month, 1);
        dateIterator.setDate(dateIterator.getDate() - firstDayOfMonth);

        // We will make 6 rows for 6 weeks,
        // since we're going to output the same week
        // before the first day and the days in the
        // same week after the last day of the month
        for (let i = 0; i < 6; i += 1) {
            if (dateIterator.getMonth() !== month && i > 0) {
                break;
            }

            const row = document.createElement('tr');
            for (let j = 0; j < 7; j += 1) {
                const cell = document.createElement('td');
                cell.textContent = dateIterator.getDate();

                if (dateIterator.getMonth() === month) {
                    cell.classList.add('current-month-day');
                    const dayForCallback = dateIterator.getDate();
                    cell.onclick = () => {
                        this.callback(this.id, {
                            month: month + 1,
                            day: dayForCallback,
                            year,
                        });
                    };
                } else {
                    // Days not inside this month will have gray color
                    cell.classList.add('gray-day');
                }
                row.appendChild(cell);
                // next day
                dateIterator.setDate(dateIterator.getDate() + 1);
            }
            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        container.appendChild(table);

        // Now we add the whole date picker on its place
        this.element.appendChild(container);
    }
}
