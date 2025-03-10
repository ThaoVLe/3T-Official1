import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Entry: {
    entryId?: string;
  };
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;