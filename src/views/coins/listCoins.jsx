import React, { useEffect, useMemo, useState } from 'react'
import Layout from 'src/layout'
import { fetchCoinTransactions } from '../../lib/api/coinsApi'
import Container from '../../components/ui/container'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Button } from '../../components/ui/button'
import { Pagination } from '../../components/ui/pagination'

const typeOptions = [
  { label: 'All types', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Earned', value: 'earn' },
  { label: 'Redeemed', value: 'redeem' },
  { label: 'Expired', value: 'expire' },
  { label: 'Reversed', value: 'reversal' },
]

const sortOptions = [
  { label: 'Date', value: 'createdAt' },
  { label: 'Coins', value: 'coins' },
  { label: 'Type', value: 'type' },
]

export default function ListCoins() {
  const [filters, setFilters] = useState({
    uid: '',
    type: '',
    refType: '',
    refID: '',
    minCoins: '',
    maxCoins: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [aggregates, setAggregates] = useState({})

  const load = async (p = page) => {
    setLoading(true)
    try {
      const { success, rows, total, aggregates } = await fetchCoinTransactions({ ...filters, page: p, limit })
      if (success) {
        setRows(rows)
        setTotal(total)
        setAggregates(aggregates || {})
        setPage(p)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(1) }, [])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => load(1)
  const handleReset = () => {
    const base = { uid: '', type: '', refType: '', refID: '', minCoins: '', maxCoins: '', startDate: '', endDate: '', sortBy: 'createdAt', sortDir: 'DESC' }
    setFilters(base)
    setTimeout(() => load(1), 0)
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const exportCsv = () => {
    const headers = ['txnID','uid','username','email','type','coins','refType','refID','createdAt']
    const csv = [headers.join(',')].concat(rows.map(r => [r.txnID,r.uid,`"${r.username||''}"`,`"${r.emailID||''}"`,r.type,r.coins,r.refType||'',r.refID||'',new Date(r.createdAt).toISOString()].join(','))).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coin-transactions-page-${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout active={'admin-coins-list'}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
    <Container>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Coin Transactions</h1>
        <div className="flex gap-2">
          <Button onClick={exportCsv} variant="primary">Export CSV</Button>
          <Select value={String(limit)} onChange={e => setLimit(Number(e.target.value))}>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </div>
      </div>

      {/* Aggregates */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-white border rounded p-3"><div className="text-xs text-gray-500">Pending</div><div className="text-lg font-semibold text-yellow-600">{aggregates.totalPending || 0}</div></div>
        <div className="bg-white border rounded p-3"><div className="text-xs text-gray-500">Earned</div><div className="text-lg font-semibold text-green-600">{aggregates.totalEarned || 0}</div></div>
        <div className="bg-white border rounded p-3"><div className="text-xs text-gray-500">Redeemed</div><div className="text-lg font-semibold text-blue-600">{aggregates.totalRedeemed || 0}</div></div>
        <div className="bg-white border rounded p-3"><div className="text-xs text-gray-500">Expired</div><div className="text-lg font-semibold text-gray-700">{aggregates.totalExpired || 0}</div></div>
        <div className="bg-white border rounded p-3"><div className="text-xs text-gray-500">Reversed</div><div className="text-lg font-semibold text-red-600">{aggregates.totalReversed || 0}</div></div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input placeholder="UID" value={filters.uid} onChange={e => handleFilterChange('uid', e.target.value)} />
          <Input placeholder="Ref Type (e.g., order)" value={filters.refType} onChange={e => handleFilterChange('refType', e.target.value)} />
          <Input placeholder="Ref ID (e.g., orderID)" value={filters.refID} onChange={e => handleFilterChange('refID', e.target.value)} />
          <Select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}>
            {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
          <Input type="number" placeholder="Min coins" value={filters.minCoins} onChange={e => handleFilterChange('minCoins', e.target.value)} />
          <Input type="number" placeholder="Max coins" value={filters.maxCoins} onChange={e => handleFilterChange('maxCoins', e.target.value)} />
          <Input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} />
          <Input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} />
          <Select value={filters.sortBy} onChange={e => handleFilterChange('sortBy', e.target.value)}>
            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
          <Select value={filters.sortDir} onChange={e => handleFilterChange('sortDir', e.target.value)}>
            <option value="DESC">Desc</option>
            <option value="ASC">Asc</option>
          </Select>
        </div>
        <div className="flex gap-2 justify-end mt-3">
          <Button onClick={handleReset} variant="secondary">Reset</Button>
          <Button onClick={handleApply} variant="primary">Apply</Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">TxnID</th>
                <th className="text-left p-2">UID</th>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Coins</th>
                <th className="text-left p-2">Ref</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-3" colSpan={7}>Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="p-3" colSpan={7}>No data</td></tr>
              ) : rows.map(row => (
                <tr key={row.txnID} className="border-b hover:bg-gray-50">
                  <td className="p-2">{row.txnID}</td>
                  <td className="p-2">{row.uid}</td>
                  <td className="p-2">{row.username || '-'}<div className="text-xs text-gray-500">{row.emailID || ''}</div></td>
                  <td className="p-2 capitalize">{row.type}</td>
                  <td className="p-2">{row.coins}</td>
                  <td className="p-2">{row.refType || '-'} {row.refID || ''}</td>
                  <td className="p-2">{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => load(p)}
          />
        </div>
      </div>
    </Container>
      </div>
    </Layout>
  )
}


