import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../screens/Dashboard';
import Units from '../screens/Units';
import About from '../screens/About';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useNavigation, useTheme, DrawerActions } from '@react-navigation/native';
import {lightColors,darkColors} from "../constants/color"

const Tab = createBottomTabNavigator();

const DrawerToggle = () => {
  const navigation = useNavigation();
  const { dark } = useTheme(); 

  return (
    <TouchableOpacity
      style={{ marginLeft: 16 }}
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
    >
      <MaterialIcons
        name="menu"
        size={24}
        color={dark ? darkColors.icon : lightColors.icon} 
      />
    </TouchableOpacity>
  );
};

const TabNavigator = () => {
  const { dark } = useTheme(); 
  const iconColor = dark ? darkColors.icon : "#620e0f";
  const activeColor = dark ? darkColors.icon : lightColors.icon;
  const inactiveColor = dark ? '#999' : '#620e0f';
  return (
    <Tab.Navigator
      screenOptions={{
        headerLeft: () => <DrawerToggle />,
        tabBarActiveTintColor: activeColor,      
        tabBarInactiveTintColor: inactiveColor, 
        tabBarStyle: { backgroundColor: dark ? darkColors.card : lightColors.card },
        headerStyle: { backgroundColor: dark ? darkColors.card : lightColors.card },
        headerTintColor: dark ? darkColors.text : lightColors.text,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({size}) => <MaterialIcons name="dashboard" color={iconColor} size={size} />,
        }}
      />
      <Tab.Screen
        name="Units"
        component={Units}
        options={{
          tabBarIcon: ({size}) => <MaterialIcons name="store" color={iconColor} size={size} />,
        }}
      />
      <Tab.Screen
        name="About"
        component={About}
        options={{
          tabBarIcon: ({size}) => <MaterialIcons name="info" color={iconColor} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
