import React, { useState } from 'react'
import Layout from '../layout'
import './dashboard.css'
import DatePickerComponent from '../components/ui/datepicker'
import AnalyseCard from '../components/ui/analyseCard'
import { FaUsers, FaShoppingCart } from 'react-icons/fa';
import Container from '../components/ui/container'
const Dashboard = () => {
    const [dateTo, setDateTo] = useState(new Date());
    const [dateFrom, setDateFrom] = useState(new Date());

    const handleDateTo = (newDate) => {
        setDateTo(newDate);
        console.log("Selected date:", newDate);
    };

    const handleDateFrom = (newDate) => {
        setDateFrom(newDate);
        console.log("Selected date:", newDate);
    };
    return (
        <Layout active={'admin-1'} title={'Dashboard'}>
            <div className="dashboard-daterange">
                <DatePickerComponent
                    selectedDate={dateFrom}
                    disableFutureDates={true}
                    onDateChange={handleDateFrom}
                />

                <DatePickerComponent
                    selectedDate={dateTo}
                    disableFutureDates={true}
                    onDateChange={handleDateTo}
                    minDate={dateFrom}
                />

            </div>
            <div className="small-analysis-m-container">
                <AnalyseCard title="CUSTOMERS" Icon={FaUsers} improves={true} count={54214} growth={2541} since="Go To Analyse Page" />
                <AnalyseCard title="CUSTOMERS" Icon={FaUsers} count={54214} growth={2541} since="Go To Analyse Page" />
                <AnalyseCard title="CUSTOMERS" Icon={FaUsers} improves={true} count={54214} growth={2541} since="Go To Analyse Page" />
                <AnalyseCard title="CUSTOMERS" Icon={FaShoppingCart} count={54214} growth={2541} since="Go To Analyse Page" />

            </div>
        </Layout>
    )
}

export default Dashboard