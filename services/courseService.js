const dbConnection = require("../db/sqlite");
const courseRepository = require("../repositories/courseRepository");

dbConnection
  .getDbConnection()
  .then((db) => {
    courseRepository.init(db);
  })
  .catch((err) => {
    console.log(err);
    throw err;
  });

async function allCourses(userId) {
  const courses = courseRepository.getAllCourses(userId);
  return courses;
}

async function userCourses(userId) {
  const courses = courseRepository.getUserCourses(userId);
  return courses;
}

async function searchedCourses(userId, searchVal) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await courseRepository.getSearchedCourses(userId, searchVal));
    } catch (error) {
      reject(error);
    }
  });
}

async function sortedCourses(userId, criteria) {
  const courses = courseRepository.getSortedCourses(userId, criteria);
  return courses;
}

async function courseDetails(userId, courseId) {
  const courses = courseRepository.getCourseDetails(userId, courseId);
  return courses;
}

async function getUserCourseProgress(userId, courseId) {
  const progress = courseRepository.getUserCourseProgress(userId, courseId);
  return progress;
}

async function courseEnroll(userId, courseId) {
  const courses = courseRepository.enrollInCourse(userId, courseId);
  return courses;
}

async function courseContentDetails(userId, courseId) {
  const courses = courseRepository.getCourseContentDetails(userId, courseId);
  return courses;
}

async function resetCourses(userId) {
  const courses = courseRepository.resetEnrolledCourses(userId);
  return courses;
}

async function courseMcq(courseId) {
  const courseMcq = courseRepository.getCourseMcq(courseId);
  return courseMcq;
}

async function courseScore(courseId, userId, ans1, ans2, ans3) {
  const courseScore = courseRepository.setCourseScore(
    courseId,
    userId,
    ans1,
    ans2,
    ans3
  );
  return courseScore;
}

async function suggestedCourseBooks(title) {
  const books = await courseRepository.getSuggestedBooks(title);
  return books;
}

module.exports = {
  allCourses,
  userCourses,
  getUserCourseProgress,
  searchedCourses,
  sortedCourses,
  courseDetails,
  courseEnroll,
  courseContentDetails,
  resetCourses,
  courseMcq,
  courseScore,
  suggestedCourseBooks,
};
