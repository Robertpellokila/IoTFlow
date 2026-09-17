export type DeviceType = "ESP32" | "ESP32-S3" | "ESP8266" | "Other";
export type DeviceStatus = "online" | "offline";
export type CommandStatus = "pending" | "executed" | "failed";
export type AlertStatus = "active" | "resolved";
export type UserRole = "student" | "teacher" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  name: string;
  device_id: string;
  device_token: string;
  device_type: DeviceType;
  status: DeviceStatus;
  last_seen: string | null;
  firmware_version: string | null;
  ip_address: string | null;
  uptime: string | null;
  battery: string | null;
  created_at: string;
}

export interface Dashboard {
  id: string;
  user_id: string;
  device_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export type WidgetType =
  | "value"
  | "gauge"
  | "switch"
  | "button"
  | "slider"
  | "chart"
  | "status"
  | "led"
  | "text"
  | "progress"
  | "compass"
  | "thermometer"
  | "map"
  | "speedometer"
  | "table"
  | "colorpicker";

export interface WidgetConfig {
  min?: number;
  max?: number;
  refresh?: string;
  color?: string;
  command?: string;
  commandValue?: string | number | boolean;
  chartType?: "line" | "bar";
  historyPoints?: number;
  colorFormat?: "hex" | "rgb";
  tableColumns?: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  w: number;
  h: number;
}

export interface Widget {
  id: string;
  dashboard_id: string;
  type: WidgetType;
  title: string;
  data_key: string | null;
  unit: string | null;
  config: WidgetConfig;
  position: WidgetPosition;
  size: WidgetSize;
  created_at: string;
}

export interface SensorData {
  id: string;
  device_id: string;
  data: Record<string, number | boolean | string | null>;
  created_at: string;
}

export interface Command {
  id: string;
  device_id: string;
  command: string;
  value: string | number | boolean | null;
  status: CommandStatus;
  created_at: string;
  executed_at: string | null;
}

export interface Alert {
  id: string;
  device_id: string;
  user_id: string;
  type: string;
  message: string;
  value: string | null;
  status: AlertStatus;
  rule_config: Record<string, unknown> | null;
  created_at: string;
}

export interface DeviceTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  sensors: string[];
  controls: string[];
  alerts?: string[];
  widgets: Array<{
    type: WidgetType;
    title: string;
    data_key: string;
    unit: string;
    config: WidgetConfig;
    size: WidgetSize;
  }>;
}
