import apiClient from './client';

// Moodle Instances
export const getMoodleInstances = async (activeOnly = false) => {
  const params = activeOnly ? { active_only: true } : {};
  const response = await apiClient.get('/api/v1/moodle-instances', { params });
  return response.data;
};

export const getMoodleInstance = async (id: number) => {
  const response = await apiClient.get(`/api/v1/moodle-instances/${id}`);
  return response.data;
};

export const createMoodleInstance = async (data: any) => {
  const response = await apiClient.post('/api/v1/moodle-instances', data);
  return response.data;
};

export const updateMoodleInstance = async (id: number, data: any) => {
  const response = await apiClient.put(`/api/v1/moodle-instances/${id}`, data);
  return response.data;
};

export const deleteMoodleInstance = async (id: number) => {
  await apiClient.delete(`/api/v1/moodle-instances/${id}`);
};

export const testMoodleConnection = async (id: number) => {
  const response = await apiClient.post(`/api/v1/moodle-instances/${id}/test`);
  return response.data;
};

// Dashboard & Courses
export const getDashboardStats = async () => {
  const response = await apiClient.get('/api/v1/dashboard/stats');
  return response.data;
};

export const getInstanceCourses = async (instanceId: number) => {
  const response = await apiClient.get(`/api/v1/instances/${instanceId}/courses`);
  return response.data;
};

export const getCourseUsers = async (instanceId: number, courseId: number) => {
  const response = await apiClient.get(`/api/v1/instances/${instanceId}/courses/${courseId}/users`);
  return response.data;
};

export const getUserCompletion = async (instanceId: number, courseId: number, userId: number) => {
  const response = await apiClient.get(`/api/v1/instances/${instanceId}/courses/${courseId}/users/${userId}/completion`);
  return response.data;
};

export const getUserGrades = async (instanceId: number, courseId: number, userId: number) => {
  const response = await apiClient.get(`/api/v1/instances/${instanceId}/courses/${courseId}/users/${userId}/grades`);
  return response.data;
};

export const getUserActivitiesCompletion = async (instanceId: number, courseId: number, userId: number) => {
  const response = await apiClient.get(`/api/v1/instances/${instanceId}/courses/${courseId}/users/${userId}/activities`);
  return response.data;
};

export const getCourseContents = async (instanceId: number, courseId: number) => {
  const response = await apiClient.get(`/api/v1/instances/${instanceId}/courses/${courseId}/contents`);
  return response.data;
};

export const getCourseCustomReport = async (instanceId: number, courseId: number) => {
  const response = await apiClient.get(`/api/v1/instances/${instanceId}/courses/${courseId}/report`);
  return response.data;
};

// Course Reports Management
export const getCourseReports = async (instanceId: number) => {
  const response = await apiClient.get(`/api/v1/course-reports/${instanceId}`);
  return response.data;
};

export const getCourseReport = async (instanceId: number, courseId: number) => {
  const response = await apiClient.get(`/api/v1/course-reports/${instanceId}/${courseId}`);
  return response.data;
};

export const createCourseReport = async (instanceId: number, data: any) => {
  const response = await apiClient.post(`/api/v1/course-reports/${instanceId}`, data);
  return response.data;
};

export const updateCourseReport = async (instanceId: number, courseId: number, data: any) => {
  const response = await apiClient.put(`/api/v1/course-reports/${instanceId}/${courseId}`, data);
  return response.data;
};

export const deleteCourseReport = async (instanceId: number, courseId: number) => {
  await apiClient.delete(`/api/v1/course-reports/${instanceId}/${courseId}`);
};
