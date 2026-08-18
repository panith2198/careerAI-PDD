import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { AssessmentsScreen } from '../screens/AssessmentsScreen';
import { CareersScreen } from '../screens/CareersScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { JobsScreen } from '../screens/JobsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RoadmapScreen } from '../screens/RoadmapScreen';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme';

type AuthStackParamList = {
  Login: undefined;
};

type AppTabParamList = {
  Dashboard: undefined;
  Careers: undefined;
  Assessments: undefined;
  Jobs: undefined;
  Roadmap: undefined;
  Chat: undefined;
  Profile: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tabs = createBottomTabNavigator<AppTabParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    primary: colors.primary,
    text: colors.text,
  },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen component={LoginScreen} name="Login" />
    </AuthStack.Navigator>
  );
}

function tabIcon(routeName: keyof AppTabParamList, focused: boolean) {
  const color = focused ? colors.primarySoft : colors.dim;
  const iconMap: Record<keyof AppTabParamList, keyof typeof Ionicons.glyphMap> = {
    Dashboard: focused ? 'grid' : 'grid-outline',
    Careers: focused ? 'briefcase' : 'briefcase-outline',
    Assessments: focused ? 'school' : 'school-outline',
    Jobs: focused ? 'search' : 'search-outline',
    Roadmap: focused ? 'map' : 'map-outline',
    Chat: focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline',
    Profile: focused ? 'person' : 'person-outline',
  };

  return <Ionicons color={color} name={iconMap[routeName]} size={22} />;
}

function AppTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primarySoft,
        tabBarInactiveTintColor: colors.dim,
        tabBarStyle: {
          height: 72,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused }) => tabIcon(route.name, focused),
      })}
    >
      <Tabs.Screen component={DashboardScreen} name="Dashboard" />
      <Tabs.Screen component={CareersScreen} name="Careers" />
      <Tabs.Screen component={AssessmentsScreen} name="Assessments" />
      <Tabs.Screen component={JobsScreen} name="Jobs" />
      <Tabs.Screen component={RoadmapScreen} name="Roadmap" />
      <Tabs.Screen component={ChatScreen} name="Chat" />
      <Tabs.Screen component={ProfileScreen} name="Profile" />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primarySoft} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>{isAuthenticated ? <AppTabs /> : <AuthNavigator />}</NavigationContainer>
  );
}
