import type { ReactNode } from "react";
import type { HealthStatus } from "@lieshoucloud/contract-types";
import { StyleSheet, Text, View } from "react-native";

const COLORS: Record<HealthStatus, string> = {
  up: "#52c41a",
  down: "#f5222d",
  degraded: "#faad14",
};

const LABELS: Record<HealthStatus, string> = {
  up: "UP",
  down: "DOWN",
  degraded: "DEGRADED",
};

interface MobileHealthBadgeProps {
  status: HealthStatus;
  serviceName?: string;
  testID?: string;
}

/**
 * Mobile-native HealthBadge (React Native View + Text).
 *
 * 与 web HealthBadge (packages/ui/src/components/HealthBadge.tsx) 同名
 * 但实现完全不同 —— RN 没有 DOM span, 用 View + Text.
 *
 * 共享：HealthStatus 类型 from @lieshoucloud/types.
 *
 * @see .ai/decisions/0013-mobile-app.md
 */
export function MobileHealthBadge({ status, serviceName, testID }: MobileHealthBadgeProps): ReactNode {
  return (
    <View
      testID={testID ?? "mobile-health-badge"}
      style={[styles.badge, { backgroundColor: COLORS[status] }]}
      accessibilityRole="text"
      accessibilityLabel={`${serviceName ?? "service"} ${LABELS[status]}`}
    >
      <Text style={styles.label}>
        {serviceName ? `${serviceName}: ` : ""}
        {LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  label: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
});
