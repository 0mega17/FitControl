const axios = require('axios');

const BASE_URL = 'https://oss.exercisedb.dev/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

const listExercises = async ({ cursor, limit = 20, bodyParts, targetMuscles, equipments, name } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  if (bodyParts) params.bodyParts = bodyParts;
  if (targetMuscles) params.targetMuscles = targetMuscles;
  if (equipments) params.equipments = equipments;
  if (name) params.name = name;

  const { data } = await apiClient.get('/exercises', { params });
  return data;
};

const getExerciseById = async (id) => {
  const { data } = await apiClient.get(`/exercises/${id}`);
  return data;
};

module.exports = { listExercises, getExerciseById };
