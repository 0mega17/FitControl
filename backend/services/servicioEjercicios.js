const axios = require('axios');

const BASE_URL = 'https://oss.exercisedb.dev/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

/**
 * @description Obtiene lista paginada de ejercicios desde ExerciseDB API.
 * @param {Object} [opts={}]
 * @param {string} [opts.cursor] - Paginación
 * @param {number} [opts.limit=20] - Resultados por página
 * @param {string} [opts.bodyParts] - Filtro por parte del cuerpo
 * @param {string} [opts.targetMuscles] - Filtro por músculo objetivo
 * @param {string} [opts.equipments] - Filtro por equipo
 * @param {string} [opts.name] - Filtro por nombre
 * @returns {Promise<Object>}
 */
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

/**
 * @description Obtiene un ejercicio por su ID desde ExerciseDB API.
 * @param {string} id - ID del ejercicio en ExerciseDB
 * @returns {Promise<Object>}
 */
const getExerciseById = async (id) => {
  const { data } = await apiClient.get(`/exercises/${id}`);
  return data;
};

module.exports = { listExercises, getExerciseById };
