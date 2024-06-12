import { View, Text } from 'react-native'
import React, { useState } from 'react'
import Login from '@/components/Login'
import Register from '@/components/Register'

const Auth = () => {

    const [showLogin, setShowLogin] = useState(true)


    return (
        <View>
            {showLogin ? (
                <Login onSwitchToRegister={() => setShowLogin(false)} />
            ):(
                <Register onSwitchToLogin={() => setShowLogin(true)} />
            )}
        </View>
    )
}



export default Auth