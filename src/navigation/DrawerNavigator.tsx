import React, { useState, useEffect } from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { View, Switch, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TabNavigator from './TabNavigator';
import { useThemeContext } from '../context/ThemeContext';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../constants/color';
import Customers from '../screens/Customers';
import Expenses from '../screens/Expenses';
import WareHouses from '../screens/WareHouses';
import Bookings from '../screens/Bookings';
import Users from '../screens/Users';
const Drawer = createDrawerNavigator();
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CustomDrawerContent = (props: any) => {
  const { isDark, toggleTheme } = useThemeContext();
  const { dark } = useTheme();
  const { logout } = useAuth();
  const [userName, setUserName] = useState('');
  const [isUnitManagementExpanded, setIsUnitManagementExpanded] = useState(false);

  useEffect(() => {
    const getUserName = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          setUserName(user);
        } else {
          setUserName('Guest');
        }
      } catch (error) {
        console.log('Error getting user name:', error);
      }
    };

    getUserName();
  }, []);

  const toggleUnitManagement = () => {
    setIsUnitManagementExpanded(!isUnitManagementExpanded);
  };
  
  return (
    <View style={styles.drawerContainer}>
      <View style={[
        styles.headerSection,
        { backgroundColor: dark ? darkColors.background : lightColors.background }
      ]}>
        <View style={styles.userInfo}>
          <Text style={[
            styles.welcomeText,
            { color: dark ? darkColors.text : lightColors.text }
          ]}>
            Welcome back,
          </Text>
          <Text style={[
            styles.userNameText,
            {  color: dark ? darkColors.text : lightColors.text }
          ]}>
            {userName}
          </Text>
        </View>
      </View>

      <DrawerContentScrollView {...props} style={styles.scrollView}>
        {/* Home Section */}
        <DrawerItem
          label="Home"
          icon={({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate('Tabs')}
          labelStyle={{ color: dark ? darkColors.text : lightColors.text }}
        />

        {/* Unit Management Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity 
            style={styles.sectionHeaderButton}
            onPress={toggleUnitManagement}
          >
            <View style={styles.sectionHeaderContent}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons 
                  name="business" 
                  size={16} 
                  color={dark ? darkColors.text : lightColors.text} 
                />
                <Text style={[
                  styles.sectionHeader,
                  { color: dark ? darkColors.text : lightColors.text }
                ]}>
                  Unit Management
                </Text>
              </View>
              <Ionicons 
                name={isUnitManagementExpanded ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={dark ? darkColors.text : lightColors.text} 
              />
            </View>
          </TouchableOpacity>
          
          {isUnitManagementExpanded && (
            <>
              <DrawerItem
                label="Customers"
                icon={({ color, size }) => (
                  <Ionicons name="people" size={size} color={color} />
                )}
                onPress={() => props.navigation.navigate('Customers')}
                labelStyle={{ color: dark ? darkColors.text : lightColors.text }}
                style={styles.subMenuItem}
              />
              
              <DrawerItem
                label="Expenses"
                icon={({ color, size }) => (
                  <Ionicons name="card" size={size} color={color} />
                )}
                onPress={() => props.navigation.navigate('Expenses')}
                labelStyle={{ color: dark ? darkColors.text : lightColors.text }}
                style={styles.subMenuItem}
              />
              
              <DrawerItem
                label="Warehouses"
                icon={({ color, size }) => (
                  <Ionicons name="storefront" size={size} color={color} />
                )}
                onPress={() => props.navigation.navigate('Warehouses')}
                labelStyle={{ color: dark ? darkColors.text : lightColors.text }}
                style={styles.subMenuItem}
              />
              
              <DrawerItem
                label="Bookings"
                icon={({ color, size }) => (
                  <Ionicons name="calendar" size={size} color={color} />
                )}
                onPress={() => props.navigation.navigate('Bookings')}
                labelStyle={{ color: dark ? darkColors.text : lightColors.text }}
                style={styles.subMenuItem}
              />
            </>
          )}
        </View>

        {/* Users Section */}
        <DrawerItem
          label="Users"
          icon={({ color, size }) => (
            <Ionicons name="person-circle" size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate('Users')}
          labelStyle={{ color: dark ? darkColors.text : lightColors.text }}
        />

        <View style={styles.toggleSection}>
          <Text style={{ color: dark ? darkColors.text : lightColors.text }}>
            Dark Mode
          </Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </DrawerContentScrollView>

      <View style={[
        styles.footerSection,
        { borderTopColor: dark ? darkColors.border : lightColors.border }
      ]}>
        <Image
          source={require('../../assets/logo.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[
          styles.appVersionText,
          { color: dark ? darkColors.text : lightColors.text }
        ]}>
          Version 1.0.0
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  headerSection: {
    padding: 20,
    paddingTop: 50, 
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userInfo: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.7,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  sectionContainer: {
    marginVertical: 10,
  },
  sectionHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    opacity: 0.8,
  },
  subMenuItem: {
    marginLeft: 16,
  },
  toggleSection: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  logoutText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  footerSection: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  logoImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  appVersionText: {
    fontSize: 12,
    opacity: 0.6,
  },
});

const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{ 
      headerShown: false,
      drawerStyle: {
        width: 280,
      },
    }}
    drawerContent={(props) => <CustomDrawerContent {...props} />}
  >
    <Drawer.Screen
      name="Tabs"
      component={TabNavigator}
      options={{ drawerLabel: 'Home' }}
    />
    <Drawer.Screen
      name="Customers"
      component={Customers}
      options={{ drawerLabel: 'Customers', headerShown: true }}
    />
    <Drawer.Screen
      name="Expenses"
      component={Expenses}
      options={{ drawerLabel: 'Expenses', headerShown: true }}
    />
    <Drawer.Screen
      name="Warehouses"
      component={WareHouses}
      options={{ drawerLabel: 'Warehouses', headerShown: true }}
    />
    <Drawer.Screen
      name="Bookings"
      component={Bookings}
      options={{ drawerLabel: 'Bookings', headerShown: true }}
    />
    <Drawer.Screen
      name="Users"
      component={Users}
      options={{ drawerLabel: 'Users', headerShown: true }}
    />
  </Drawer.Navigator>
);

export default DrawerNavigator;