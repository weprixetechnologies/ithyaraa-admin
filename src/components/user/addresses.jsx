import React from 'react'
import Container from '../ui/container'

const Addresses = ({ address }) => {
    return (
        <Container gap={'10'} title={'Addresses'}>

            {
                address?.map((i, index) => (
                    <div className="address-container" key={index}>
                        <p className="addresstype">

                            {
                                i.type
                            }
                        </p>
                        <p className="address-text">
                            <span>
                                <span>
                                    <b>Address Line 1:
                                    </b>  </span>
                                {
                                    i.addressLine1
                                }
                            </span>
                            <span>
                                <span>
                                    <b>
                                        Address Line 2:
                                    </b>
                                </span>

                                {
                                    i.addressLine2
                                }
                            </span>
                            <span>
                                <b>  Pincode :
                                </b>  {
                                    i.pincode
                                }
                            </span>
                            <span>
                                <b>  City :
                                </b>  {
                                    i.city
                                }
                            </span>
                            <span>
                                <b>  State :
                                </b>  {
                                    i.state
                                }
                            </span>
                        </p>
                    </div>
                ))
            }
        </Container>
    )
}

export default Addresses