import React from 'react'
import Container from '../ui/container'

const LoginDataComponent = ({ loginData }) => {
    return (
        <Container gap={'10'} title={'Login Info'}>
            <div className="logindata">
                <div className="child-logindata">
                    <span className='child-logindata-1'>
                        Login Date
                    </span>
                    <span>
                        {
                            loginData.lastLogin
                        }
                    </span>
                </div>
                <div className="child-logindata">
                    <span className='child-logindata-1'>
                        Login Time
                    </span>
                    <span>
                        {
                            loginData.lastLogin
                        }
                    </span>
                </div>
                <div className="child-logindata">
                    <span className='child-logindata-1'>
                        Device
                    </span>
                    <span>
                        {
                            loginData.device
                        }
                    </span>
                </div>
            </div>
        </Container>)
}

export default LoginDataComponent