
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: {
    sessionExpired?: boolean;
  };
  Home: undefined;
  Entry: {
    entryId?: string;
  };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthScreenRouteProp = RouteProp<RootStackParamList, 'Auth'>;
