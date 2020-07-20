import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack'; // navegação em pilha, quando o usuario navega para outras telas as telas anteriores não deixam de existir

import Home from './pages/home';
import Points from './pages/points';
import Detail from './pages/detail';

const AppStack = createStackNavigator(); // Criar navegar stack como exemplificado na documentação do @react-navigation/stack

const Routes = () => { // NavigationContainer define como as rotas devem se comportar
    return (
        <NavigationContainer>
            <AppStack.Navigator 
            headerMode="none" 
            screenOptions={{
                cardStyle: {
                    backgroundColor: '#f0f0f5'
                }
            }}>
                <AppStack.Screen name="Home" component={Home} />
                <AppStack.Screen name="Points" component={Points} />
                <AppStack.Screen name="Detail" component={Detail} />
            </AppStack.Navigator>
        </NavigationContainer>
    );
};

export default Routes;