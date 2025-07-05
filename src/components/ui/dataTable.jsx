import React, { useMemo, useState, useEffect } from 'react';
import './ui-component.css';

const DataTable = ({
    columns = [], // [{ label: 'Product ID', value: 'productid' }]
    data = [],
    searchQuery = '',
    searchColumn = '',
    defaultEntries = 6,
    actions = null
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(defaultEntries);
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const lowerSearch = searchQuery.toLowerCase();

        let result = [];

        if (searchColumn && columns.find(c => c.value === searchColumn)) {
            result = data.filter(row =>
                String(row[searchColumn]).toLowerCase().includes(lowerSearch)
            );
        } else {
            result = data.filter(row =>
                Object.values(row).some(val =>
                    String(val).toLowerCase().includes(lowerSearch)
                )
            );
        }

        setFilteredData(result);
        setCurrentPage(1);
    }, [searchQuery, data, searchColumn, columns]);

    const totalPages = Math.ceil(filteredData?.length / entriesPerPage);

    const currentData = useMemo(() => {
        const start = (currentPage - 1) * entriesPerPage;
        return filteredData.slice(start, start + entriesPerPage);
    }, [currentPage, entriesPerPage, filteredData]);

    return (
        <div className="datatable-container">
            <div className="table-wrapper">
                <table className="datatable improved">
                    <thead>
                        <tr>
                            {columns?.map((col, index) => (
                                <th key={index}>{col.label}</th>
                            ))}
                            {actions && <th className="sticky-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData?.length > 0 ? (
                            currentData?.map((row, idx) => (
                                <tr key={idx}>
                                    {columns?.map((col, i) => (
                                        <td
                                            key={i}
                                            data-tooltip={String(row[col.value])}
                                            title={String(row[col.value])}
                                        >
                                            {String(row[col.value])}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="table-actions sticky-right">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    style={{ textAlign: 'center' }}
                                >
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination-controls">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
                {[...Array(totalPages)]?.map((_, i) => (
                    <button
                        key={i}
                        className={i + 1 === currentPage ? 'active' : ''}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
            </div>
        </div>
    );
};

export default DataTable;
