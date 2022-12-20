import { useRouter } from "next/router";
import { FormEventHandler, useState } from "react";
import Input from "../../Input/Input";
import styles from "./Course.module.scss";

export interface CourseMedian {
  termCode: string;
  medianGrade: string;
}

export interface CourseReview {
  id: string;
  termCode: string;
  professor: string; // ! eventually this will be an id
  content: string;
}

export interface CourseProfessor {
  id: string;
  name: string;
  reviews: CourseReview[];
}

export interface Course {
  id: string;
  name: string;
  lastOffered: string;
  description: string;
  orcLink: string;
  qualityScore: number;
  layupScore: number;
  medians: CourseMedian[];
  reviews: CourseReview[];
}

export interface CourseProps {
  course: Course;
  similarCourses: Course[];
}

export const NUM_REVIEWS_PER_PAGE = 50;

const Course = ({ course, similarCourses }: CourseProps) => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleUpvoteQuality = () => {
    console.log("increase quality score");
  };

  const handleDownvoteQuality = () => {
    console.log("decrease quality score");
  };

  const handleUpvoteLayup = () => {
    console.log("increase layup score");
  };

  const handleDownvoteLayup = () => {
    console.log("decrease layup score");
  };

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    router.push(`course/${course.id}/review_search?q=${query}`);
  };

  return (
    <div className={styles.courseContainer}>
      <section className={styles.introContainer}>
        <h1>{course.name}</h1>
        <p className={styles.introLastOffered}>
          Last offered {course.lastOffered}
        </p>
        <p>{course.description}</p>
        <p>
          <a href={course.orcLink}>View on ORC</a>.
        </p>
      </section>

      <section>
        <div className={styles.scoresContainer}>
          <div className={styles.scoreContainer}>
            <button
              className={styles.scoreArrow}
              type="button"
              onClick={handleUpvoteQuality}
            >
              up
            </button>
            <p className={styles.scoreText}>{course.qualityScore}</p>
            <button
              className={styles.scoreArrow}
              type="button"
              onClick={handleDownvoteQuality}
            >
              down
            </button>
            <p>said it was good</p>
          </div>

          <div className={styles.scoreContainer}>
            <button
              className={styles.scoreArrow}
              type="button"
              onClick={handleUpvoteLayup}
            >
              up
            </button>
            <p className={styles.scoreText}>{course.layupScore}</p>
            <button
              className={styles.scoreArrow}
              type="button"
              onClick={handleDownvoteLayup}
            >
              down
            </button>
            <p>called it a layup</p>
          </div>
        </div>
        <p>
          Know how to code?{" "}
          <a href="https://github.com/layuplist/layup-list">
            Try contributing to Layup List!
          </a>
        </p>
      </section>

      <section>
        <h2>Medians</h2>
        <div>Graph lol</div>
      </section>

      <section>
        <h2>Professors</h2>
        <div>table here</div>
      </section>

      <section>
        <h2>Reviews ({course.reviews.length})</h2>
        <Input query={query} setQuery={setQuery} handleSubmit={handleSubmit} />

        <div>
          {course.reviews
            .filter((_, idx) => idx < NUM_REVIEWS_PER_PAGE)
            .map((r) => (
              <div key={r.id}>{JSON.stringify(r)}</div>
            ))}
        </div>
      </section>

      <section>
        <h2>Similar Courses</h2>
        <div>
          {similarCourses.map((c) => (
            <div key={c.id}>{c.name}</div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Course;
