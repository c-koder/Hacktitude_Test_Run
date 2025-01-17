const fetch = require("node-fetch");

let _db;

function init(db) {
  _db = db;
}

const knex_db = require("../db/db-config");

function getRecentCourses(count) {
  const sql = `SELECT * from courses ORDER BY id DESC LIMIT ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [count])
      .then((courses) => {
        resolve(courses);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getAllCourses(userId) {
  const sql = `SELECT * from userCourses WHERE uid = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [userId])
      .then(() => {
        const sql2 = `SELECT id, title, duration, level FROM courses`;

        knex_db
          .raw(sql2)
          .then((courses) => {
            resolve(courses);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getUserCourses(userID) {
  const sql = `SELECT * from userCourses WHERE uid = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [userID])
      .then((courses) => {
        const injectedString = courses.map((c) => `'${c.cid}'`).join(", ");
        const sql2 = `SELECT courses.id, courses.title, userCourses.score FROM courses INNER JOIN userCourses WHERE id IN (${injectedString}) AND courses.id == userCourses.cid AND userCourses.uid = ?`;

        knex_db
          .raw(sql2, [userID])
          .then((courses) => {
            resolve(courses);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getUserCourseProgress(userID, courseID) {
  const sql = `SELECT progress from userCourses WHERE uid = ? AND cid = ?`;
  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [userID, courseID])
      .then((progress) => {
        resolve(progress[0]);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getSearchedCourses(userID, searchVal) {
  const sql = `SELECT * from userCourses WHERE uid = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [userID])
      .then(() => {
        const sql2 = `SELECT title, level FROM courses WHERE title LIKE ?`;

        knex_db
          .raw(sql2, [searchVal + "%"])
          .then((courses) => {
            resolve(courses);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getSortedCourses(userId, criteria) {
  const sql = `SELECT * from userCourses WHERE uid = ?`;

  return new Promise((resolve, reject) => {
    if (criteria == "name") {
      knex_db
        .raw(sql, [userId])
        .then(() => {
          const sql2 = `SELECT id, title, duration, level FROM courses ORDER BY title`;

          knex_db
            .raw(sql2)
            .then((courses) => {
              resolve(courses);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    } else {
      knex_db
        .raw(sql, [userId])
        .then(() => {
          const sql2 = `SELECT id, title, duration, level FROM courses WHERE level = ? ORDER BY title`;

          knex_db
            .raw(sql2, [criteria])
            .then((courses) => {
              resolve(courses);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
}

function getCourseDetails(userId, courseId) {
  const sql = `SELECT id, title, level, duration, description FROM courses WHERE id = ?`;
  const sql2 = `SELECT uid FROM userCourses WHERE cid = ? AND uid = ?`;

  let registered = "";

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql2, [courseId, userId])
      .then((data) => {
        if (data.length > 0) {
          registered = "yes";
        } else {
          registered = "no";
        }
      })
      .catch((error) => {
        reject(error);
      });

    knex_db
      .raw(sql, [courseId])
      .then((courses) => {
        let course = courses[0];
        resolve({ course, registered });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function enrollInCourse(userId, courseId) {
  const sql = `INSERT INTO userCourses(cid,uid,score) VALUES(?,?,-1)`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [courseId, userId])
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getCourseContentDetails(courseId) {
  const sql = `SELECT id, title, duration, level, description FROM courses WHERE id = ?`;
  const sql1 = `SELECT description, id FROM chapters WHERE cid = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [courseId])
      .then((course_data) => {
        knex_db
          .raw(sql1, [courseId])
          .then((chapters_data) => {
            let course = course_data[0];
            let chapters = chapters_data;
            resolve({ course, chapters });
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function resetEnrolledCourses(userId) {
  const sql = `DELETE FROM userCourses WHERE uid = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql, [userId])
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function getCourseMcq(courseId) {
  const sql1 = `SELECT qid FROM courseQuestions WHERE cid = ?`;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql1, [courseId])
      .then((data) => {
        const injectedString = data.map((c) => `'${c.qid}'`).join(", ");
        const sql2 = `SELECT qid, questions FROM mcqQuestions WHERE qid IN (${injectedString}) `;

        knex_db
          .raw(sql2)
          .then((questions) => {
            const injectedString = data.map((c) => `'${c.qid}'`).join(", ");
            const sql3 = `SELECT qid, answer, aid FROM mcqAnswers WHERE qid IN (${injectedString})`;

            knex_db
              .raw(sql3)
              .then((answers) => {
                resolve({ questions, answers });
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function setCourseScore(courseId, userId, ans1, ans2, ans3) {
  const sql1 = `SELECT qid FROM courseQuestions WHERE cid = ?`;
  const sql3 = `UPDATE userCourses SET score = ? WHERE (cid = ? AND uid = ?)`;
  const sql4 = `SELECT score FROM userCourses WHERE (cid = ? AND uid = ?)`;

  let score = 0;

  return new Promise((resolve, reject) => {
    knex_db
      .raw(sql1, [courseId])
      .then((data) => {
        const injectedString = data.map((q) => `'${q.qid}'`).join(", ");
        const sql2 = `SELECT aid FROM questionAnswers WHERE qid IN (${injectedString})`;

        knex_db
          .raw(sql2)
          .then((data) => {
            if (ans1 == Object.values(data[0])) {
              score = score + 10;
            }
            if (ans2 == Object.values(data[1])) {
              score = score + 10;
            }
            if (ans3 == Object.values(data[2])) {
              score = score + 10;
            }

            knex_db
              .raw(sql3, [score, courseId, userId])
              .then(() => {
                knex_db
                  .raw(sql4, [courseId, userId])
                  .then(() => {
                    resolve(score);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              })
              .catch((error) => {
                reject(error);
              });
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function getSuggestedBooks(title) {
  // return new Promise((resolve, reject) => {

  try {
    const api_url = `http://openlibrary.org/subjects/${title.toLowerCase()}.json?`;
    const response = await fetch(api_url);
    const data = await response.json();
    const { works } = data;
    return works;
    // if (err) {
    //     reject(err)
    // } else {
    //     resolve(books)
    // }
  } catch (e) {
    console.log(e);
  }

  // })
}

module.exports = {
  getAllCourses,
  getUserCourses,
  getUserCourseProgress,
  getSearchedCourses,
  getSortedCourses,
  getCourseDetails,
  enrollInCourse,
  getCourseContentDetails,
  resetEnrolledCourses,
  getCourseMcq,
  setCourseScore,
  getSuggestedBooks,
  getRecentCourses,
  init,
};
