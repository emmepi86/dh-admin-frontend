// User types
export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

// Moodle Instance types
export interface MoodleInstance {
  id: number;
  name: string;
  slug: string;
  moodle_url: string;
  moodle_token: string;
  contact_email: string | null;
  notes: string | null;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoodleInstanceCreate {
  name: string;
  slug: string;
  moodle_url: string;
  moodle_token: string;
  contact_email?: string;
  notes?: string;
  is_active?: boolean;
}

// Moodle Course types
export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  categoryid: number;
  visible: number;
  startdate: number;
  enddate: number;
}

// Moodle User types
export interface MoodleUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  customfields?: Array<{
    type: string;
    value: string;
    name: string;
    shortname: string;
  }>;
}

// Dashboard Stats types
export interface InstanceStats {
  id: number;
  name: string;
  slug: string;
  url: string;
  courses_count: number;
  users_count: number;
  status: 'online' | 'offline' | 'error';
  last_sync: string | null;
}

export interface DashboardStats {
  summary: {
    total_instances: number;
    active_instances: number;
    total_courses: number;
    total_users: number;
  };
  instances: InstanceStats[];
}

// Test Connection types
export interface TestConnectionResponse {
  success: boolean;
  message: string;
  site_name?: string;
  moodle_version?: string;
  courses_count?: number;
  error?: string;
}
