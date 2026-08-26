import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.message}>这页不存在</Text>
        <Link href="/" style={styles.link}>
          回到首页
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.bg,
  },
  code: {
    fontSize: 64,
    fontWeight: "700",
    color: colors.primary,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  link: {
    marginTop: 24,
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
