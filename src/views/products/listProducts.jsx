import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Container from '@/components/ui/container';
import Layout from 'src/layout';
import { MdEdit } from 'react-icons/md';
import { IoMdEye } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { getPaginatedProducts, getProductCount } from './../../lib/api/productsApi';
import InputUi from '@/components/ui/inputui';

const ListProducts = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [filters, setFilters] = useState({
        name: '',
        productID: '',
        type: ''
    });

    const limit = 10;

    const handleChange = (e, name) => {
        setFilters({ ...filters, [name]: e.target.value });
    };

    const fetchProductCount = async () => {
        try {
            const { totalItems } = await getProductCount(filters);
            console.log(Math.ceil(totalItems / limit));
            console.log(totalItems);

            setTotalPages(Math.ceil(totalItems / limit));
        } catch (error) {
            console.error('Error counting products:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getPaginatedProducts({
                page,
                limit,
                filters // ✅ wrap filters in a key
            });


            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Call both on search
    const handleSearch = async () => {
        console.log(filters);

        setPage(1);
        await fetchProductCount();
        await fetchProducts();
    };

    // Call only products on page change
    useEffect(() => {
        fetchProducts();
    }, [page]);

    // Initial load
    // useEffect(() => {
    //     handleSearch();
    // }, []);

    return (
        <Layout title="Product List" active="admin-products-list">
            <Container containerclass="bg-transparent">

                {/* 🔍 Filters */}
                <div className="flex gap-4 mb-4 items-center">

                    <InputUi placeholder={'Enter Product Name'} datafunction={(e) => handleChange(e, 'name')} />
                    <InputUi placeholder={'Enter Product ID'} datafunction={(e) => handleChange(e, 'productID')} />
                    <InputUi placeholder={'Enter Product Type'} datafunction={(e) => handleChange(e, 'type')} />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white px-4 py-1 rounded"
                    >
                        Search
                    </button>
                </div>

                {/* 📦 Product Table */}
                <Table className="border-separate border-spacing-y-2">
                    <TableHeader>
                        <TableRow className="text-unique text-[16px] capitalize">
                            <TableHead className="pl-5">ID</TableHead>
                            <TableHead>Product Data</TableHead>
                            <TableHead className="text-center">Price</TableHead>
                            <TableHead className="text-center">Sale Price</TableHead>
                            <TableHead className="text-center">Discount Type</TableHead>
                            <TableHead className="text-center">Type</TableHead>
                            <TableHead className="text-center">Category</TableHead>
                            <TableHead className="text-center">Created On</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products?.map((product) => {
                            let imgUrl = '';
                            try {
                                const images = JSON.parse(product.featuredImage || '[]');
                                imgUrl = images?.[0]?.imgUrl || '';
                            } catch (e) {
                                imgUrl = '';
                            }

                            return (
                                <TableRow className="bg-white" key={product.productID}>
                                    <TableCell className="rounded-l-lg pl-5">{product.productID}</TableCell>
                                    <TableCell className="text-center py-5 min-w-[200px]">
                                        <div className="flex gap-2 justify-start items-center">
                                            <img
                                                src={imgUrl}
                                                alt=""
                                                className="h-[35px] w-[35px] rounded-full border object-cover"
                                            />
                                            <div className="flex flex-col justify-start items-start text-right">
                                                <p className="text-left font-medium max-w-[200px] hover:text-dark-secondary-text cursor-pointer">
                                                    {product.name}
                                                </p>
                                                {/* <p className="font-light text-secondary-text max-w-[350px] truncate hover:text-dark-secondary-text cursor-pointer">
                                                    {product.productID}
                                                </p> */}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{product.regularPrice}</TableCell>
                                    <TableCell className="text-center">{product.salePrice}</TableCell>
                                    <TableCell className="text-center capitalize">{product.type}</TableCell>
                                    <TableCell className="text-center capitalize">{product.discountType}</TableCell>
                                    <TableCell className="text-center">{product.categoryName}</TableCell>
                                    <TableCell className="text-center">{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex-center gap-2">
                                            <button className="bg-green-600 text-white p-2 rounded-full" onClick={() => navigate('/orders/details')}>
                                                <MdEdit size={16} />
                                            </button>
                                            <button className="bg-blue-600 text-white p-2 rounded-full" onClick={() => navigate(`/products/details/${product.productID}`)}>
                                                <IoMdEye size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {/* 🔄 Pagination */}
                <div className="flex justify-center mt-6 gap-4">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page === totalPages}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </Container>
        </Layout>
    );
};

export default ListProducts;
