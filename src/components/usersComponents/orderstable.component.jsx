//external library - shadcn
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Container from '../ui/container'
import { useState } from "react"
import { orderItems } from "src/schema"

//component
const OrderTable = () => {

    const [orderitems, setOrderItems] = useState(orderItems)
    return (
        <Container containerclass={'bg-dark-text'}>
            <Table className='text-white'>
                <TableHeader>
                    <TableRow className="text-medium">
                        <TableHead>Item ID</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Variant</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orderitems.length > 0 ? (
                        orderitems.map((i, index) => (
                            <TableRow key={i.id} className="py-2">
                                <TableCell>#{i.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-md bg-white"></div>
                                        <p className="text-2 max-w-[400px] truncate">{i.name} {i.name}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {i.status === 'pending' ? 'In Progress' :
                                        i.status === 'shipped' ? 'Shipped' :
                                            'Delivered'}
                                </TableCell>
                                <TableCell className="text-center capitalize">{i.variationSlug}</TableCell>
                                <TableCell className="text-right">₹ 699</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <div className="text-center py-8 animate-pulse text-lg text-muted-foreground">
                                    🚚 No Orders Found
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>

            </Table>
        </Container>
    )
}

export default OrderTable