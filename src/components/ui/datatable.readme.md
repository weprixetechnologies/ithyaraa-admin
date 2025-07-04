import React, { useState } from 'react'
import Layout from '../../layout'
import DataTable from '../../components/ui/dataTable'

const AddProduct = () => {
  
    const [search, setSearch] = useState('');
    const [searchCol, setSearchCol] = useState('First name');
    const data = [
        { "First name": "Airi", "Last name": "Satou", "Position": "Accountant", "Office": "Tokyo", "Age": 33, "Start date": "2008/11/28", "Salary": "$162,700", "Extn.": 5407, "E-mail": "a.satou@datatables.net" },  
    ];

    const columns = ["First name", "Last name", "Position", "Office", "Age", "Start date", "Salary", "Extn.", "E-mail"];

    return (
        <Layout title={'Add Product'} active={'ecom-4'}>
            <div className="addproducts-layout">
                
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ marginBottom: '10px', padding: '6px', width: '200px' }}
                    />
                    <select onChange={e => setSearchCol(e.target.value)} value={searchCol}>
                        {columns.map(col => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                    <DataTable
                        columns={columns}
                        data={data}
                        searchQuery={search}
                        searchColumn={searchCol}
                        defaultEntries={6}
                    />

           


            </div>
        </Layout>
    )
}

export default AddProduct