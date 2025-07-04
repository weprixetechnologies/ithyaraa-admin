import React, { useState } from 'react'
import Layout from '../../layout'
import './addproduct.css'
import Container from '../../components/ui/container'
import InputCustomLabelled from '../../components/ui/customLabelledField'

const AddProduct = () => {
    const [productName, setName] = useState('');
    const [productDescription, setDescription] = useState('');

    const updateName = (data) => {
        setName(data);
        console.log(data);
    };

    const updateDescription = (data) => {
        setDescription(data);
    };

    return (
        <Layout title={'Add Product'} active={'ecom-4'}>
            <div className="addproducts-layout">
                <div className="left-layout--product">
                    <Container title={'Basic Information'}>
                        <InputCustomLabelled
                            value={productName}
                            inputFunction={updateName}
                            type={'text'}
                            placeholder={'Enter Your Product Title (Max 100 Character)'}
                            label={'Add Product Title'}
                            htmlFor="product-title"
                        />

                        <InputCustomLabelled
                            value={productDescription}
                            inputFunction={updateDescription}
                            type={'text'}
                            placeholder={'Enter your product description'}
                            isInput={false}
                            height={200}
                            label={'Product Description'}
                            htmlFor="product-description"
                        />


                    </Container>
                </div>
                <div className="right-layout--product">
                    <Container title={'Featured Images'}></Container>
                    <Container title={'Gallery Images'}></Container>
                    <Container title={'Gallery Video'}></Container>

                </div>


            </div>
        </Layout>
    )
}

export default AddProduct