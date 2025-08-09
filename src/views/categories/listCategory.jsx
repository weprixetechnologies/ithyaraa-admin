import React, { useEffect, useState } from "react";
import Layout from "src/layout";
import {
    Table,
    TableCaption,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { getPaginatedCategories, getCategoryCount } from "./../../lib/api/categoryApi";
import { Input } from "@/components/ui/input"; // assuming input filter
import { Skeleton } from "@/components/ui/skeleton";
import { MdEdit } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const ListCategory = () => {
    const [categories, setCategories] = useState([]);
    const [categoryNameFilter, setCategoryNameFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;
    const navigate = useNavigate();

    // Fetch categories
    useEffect(() => {
        const fetchData = async () => {
            const [catRes, countRes] = await Promise.all([
                getPaginatedCategories({ page, limit, filters: { categoryName: categoryNameFilter } }),
                getCategoryCount({ categoryName: categoryNameFilter })
            ]);

            setCategories(catRes.data || []);
            setTotalItems(countRes);
        };

        fetchData();
    }, [categoryNameFilter, page]);

    // Pagination logic
    const totalPages = Math.ceil(totalItems / limit);
    const maxPagesToShow = 5;
    let pages = [];

    if (totalPages <= maxPagesToShow) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
        const middle = Math.floor(maxPagesToShow / 2);
        let start = Math.max(1, page - middle);
        let end = Math.min(totalPages, page + middle);

        if (page <= middle) {
            end = maxPagesToShow;
        } else if (page + middle >= totalPages) {
            start = totalPages - maxPagesToShow + 1;
        }

        pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    return (
        <Layout active={'admin-category-list'}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="">All Categories</h2>
                <Input
                    placeholder="Search category name"
                    value={categoryNameFilter}
                    onChange={(e) => {
                        setCategoryNameFilter(e.target.value);
                        setPage(1); // reset to first page on search
                    }}
                    className="max-w-xs"
                />
            </div>

            <div className={`rounded overflow-x-auto transition-all duration-200 `}>
                <Table className="border-separate border-spacing-y-2">
                    {/* <TableCaption className="text-gray-600">A list of all categories.</TableCaption> */}
                    <TableHeader>
                        <TableRow className="text-unique text-[16px] capitalize">
                            <TableHead className="pl-5">#</TableHead>
                            <TableHead className="text-left">Category Name</TableHead>
                            <TableHead className="text-center">Featured Image</TableHead>
                            <TableHead className="text-center">Count</TableHead>
                            <TableHead className="text-center pr-5">Banner</TableHead>
                            <TableHead className="pr-5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length > 0 ? (
                            categories.map((cat, idx) => (
                                <TableRow key={cat.categoryID} className="rounded-full bg-white text-black">
                                    <TableCell className="rounded-l-[10px] font-bold py-5 pl-5">
                                        {
                                            cat.categoryID
                                        }
                                    </TableCell>
                                    <TableCell className=" font-bold">
                                        <p style={{ fontFamily: 'var(--f2)' }}>{cat.categoryName}</p>
                                    </TableCell>
                                    <TableCell className=" font-bold text-center flex-center">
                                        <Skeleton className="absolute w-[35px] h-[35px] rounded-full" />
                                        <img src={cat.featuredImage ? cat.featuredImage : 'https://picsum.photos/200/300'} className="featuredImage rounded-full w-[35px] h-[35px]" />

                                    </TableCell>
                                    <TableCell className=" font-bold text-center">
                                        <p>{cat.count ? cat.count : 0}</p>
                                    </TableCell>
                                    <TableCell className=" font-bold text-center">
                                        {
                                            cat.categoryBanner ? <button className="bg-green-200 border-none rounded-lg px-4 py-2 font-normal">Available</button> : <button className="bg-red-200 border-none rounded-lg px-4 py-2 font-normal">No Banner</button>
                                        }
                                    </TableCell>
                                    <TableCell className="rounded-r-[10px] text-center pr-5">
                                        <div className="flex-center gap-2">
                                            <button className="bg-green-600 text-white p-2 rounded-full" onClick={() => navigate('/orders/details')}>
                                                <MdEdit size={16} />
                                            </button>
                                            <button className="bg-blue-600 text-white p-2 rounded-full" onClick={() => navigate(`/categories/details/${cat.categoryID}`)}>
                                                <IoMdEye size={16} />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>


            </div>

            {/* Pagination info */}
            <div className="flex items-center justify-between mt-4 text-sm">
                {/* <p className={totalItems === 0 ? "text-gray-400" : ""}>
                    {totalItems === 0
                        ? "No entries found."
                        : `Showing ${(page - 1) * limit + 1} to ${Math.min(
                            page * limit,
                            totalItems
                        )} of ${totalItems} entries`}
                </p> */}

                {/* Pagination controls */}
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page > 1) setPage(page - 1);
                                }}
                            />
                        </PaginationItem>

                        {/* First Page + Ellipsis */}
                        {pages[0] > 1 && (
                            <>
                                <PaginationItem>
                                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(1); }}>
                                        1
                                    </PaginationLink>
                                </PaginationItem>
                                {pages[0] > 2 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}
                            </>
                        )}

                        {/* Dynamic Page Numbers */}
                        {pages.map((pg) => (
                            <PaginationItem key={pg}>
                                <PaginationLink
                                    href="#"
                                    isActive={pg === page}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPage(pg);
                                    }}
                                >
                                    {pg}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        {/* Last Page + Ellipsis */}
                        {pages[pages.length - 1] < totalPages && (
                            <>
                                {pages[pages.length - 1] < totalPages - 1 && (
                                    <PaginationItem>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                )}
                                <PaginationItem>
                                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(totalPages); }}>
                                        {totalPages}
                                    </PaginationLink>
                                </PaginationItem>
                            </>
                        )}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (page < totalPages) setPage(page + 1);
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </Layout>
    );
};

export default ListCategory;
