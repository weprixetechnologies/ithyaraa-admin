import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePickerComponent.css';
import { FaRegCalendarAlt } from 'react-icons/fa';

const DatePickerComponent = ({ selectedDate, onDateChange, disableFutureDates, minDate }) => {
    return (
        <div className="custom-date-picker">
            <DatePicker
                selected={selectedDate}
                onChange={onDateChange}
                dateFormat="dd/MM/yyyy"
                className="date-input"
                maxDate={disableFutureDates ? new Date() : null}
                minDate={minDate || null} // ✅ New line to restrict earliest allowed date
                popperPlacement="bottom"
            />
            <div className="calendar-icon">
                <FaRegCalendarAlt size={18} />
            </div>
        </div>
    );
};


export default DatePickerComponent;
