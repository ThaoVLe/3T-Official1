export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Entry: { entryId?: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
