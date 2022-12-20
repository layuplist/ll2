import { useRouter } from "next/router";
import styles from "./Departments.module.scss";

export interface Department {
  name: string;
  code: string;
  numCourses: number;
}

export interface DepartmentsProps {
  departments: Department[];
}

const Departments = ({ departments }: DepartmentsProps) => {
  const router = useRouter();

  return (
    <div className={styles.departmentsContainer}>
      <h1>Departments</h1>

      <table>
        <thead>
          <tr>
            <th style={{ width: "10%" }}>Code</th>
            <th style={{ width: "65%" }}>Department Name</th>
            <th style={{ width: "25%" }}>Undergrad Courses</th>
          </tr>
        </thead>

        <tbody>
          {departments.map(({ code, name, numCourses }) => (
            <tr key={code} onClick={() => router.push(`/search?q=${code}`)}>
              <td>
                <a>{code}</a>
              </td>
              <td>
                <a>{name}</a>
              </td>
              <td>
                <a>{numCourses}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Departments;
