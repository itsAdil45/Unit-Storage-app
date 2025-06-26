import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Switch, Text } from 'react-native';
import TabNavigator from './TabNavigator';
import { useThemeContext } from '../context/ThemeContext';
import { useTheme  } from '@react-navigation/native';
import {lightColors,darkColors} from "../constants/color"
import Customers from '../screens/Customers';
import Expenses from '../screens/Expenses'
import WareHouses from '../screens/WareHouses';
const Drawer = createDrawerNavigator();
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

const CustomDrawerContent = (props: any) => {
  const { isDark, toggleTheme } = useThemeContext();
  const { dark } = useTheme();
  const { logout } = useAuth();

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      
      {/* Dark Mode Toggle */}
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: dark ? darkColors.text : lightColors.text }}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={{ padding: 16, borderTopWidth: 1, borderColor: '#ccc' }}
        onPress={logout}
      >
        <Text style={{ color: '#d32f2f', fontWeight: 'bold' }}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};


const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{ headerShown: false }}
    drawerContent={(props) => <CustomDrawerContent {...props} />}
  >
    <Drawer.Screen name="Tabs" component={TabNavigator} options={{ drawerLabel: 'Home' }} />
    <Drawer.Screen name="Customers" component={Customers} options={{ drawerLabel: 'Customers', headerShown:true }}  />
      <Drawer.Screen name="Expenses" component={Expenses} options={{ drawerLabel: 'Expenses', headerShown:true }}  />
    <Drawer.Screen name="Warehouses" component={WareHouses} options={{ drawerLabel: 'Warehouses', headerShown:true }}  />

  </Drawer.Navigator>
);

export default DrawerNavigator;
