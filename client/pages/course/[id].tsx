import Course, { CourseProps } from "../../components/pages/Course/Course";
import { GetStaticPaths, GetStaticProps } from "next";

export const REGENERATION_HOURS = 24;

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [{ params: { id: "5481621" } }],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<CourseProps> = () => {
  // TODO fetch data from AWS here

  return {
    props: {
      course: {
        id: "5481621",
        name: "COSC001: Introduction to Programming and Computation ",
        lastOffered: "22F",
        description:
          "This course introduces computational concepts that are fundamental to computer science and are useful for the sciences, social sciences, engineering, and digital arts. Students will write their own interactive programs to analyze data, process text, draw graphics, manipulate images, and simulate physical systems. Problem decomposition, program efficiency, and good programming style are emphasized throughout the course. No prior programming experience is assumed.",
        orcLink:
          "http://dartmouth.smartcatalogiq.com/en/current/orc/Departments-Programs-Undergraduate/Computer-Science/COSC-Computer-Science-Undergraduate/COSC-1",
        qualityScore: 758,
        layupScore: -107,
        medians: [
          { termCode: "22W", medianGrade: "A" },
          { termCode: "21F", medianGrade: "A" },
          { termCode: "21S", medianGrade: "A-" },
        ],
        reviews: [
          {
            id: "23984723984",
            termCode: "22W",
            professor: "Vasanta Lakshmi Kommineni",
            content:
              "Class was great when Vasanta taught it for the first few weeks before she had a family emergency and had to take a leave of absence. The other lecturers unfortunately did not share her talent for being actually perfect at explaining literally everything. Take it with her if you can. PSA Balkcom was especially confusing and unclear. :( As for the class in general, a lot of work but doable (even as someone with no CS background) with help from TAs especially! Not a layup by any means but I learned a lot!",
          },
          {
            id: "23984723984",
            termCode: "22W",
            professor: "Vasanta Lakshmi Kommineni",
            content:
              "As in other reviews from 22W, Vasanta had a family emergency after the first three weeks. (Best wishes to her; she is genuinely a wonderful person, and it is so sad to think of bad things happening to her or her loved ones.) I thought the class was hard before she left. Turns out, you don't know what you have until you lose it. At the very least, I've learned that I won't be taking more CS classes. Computers are horrifying. It's a doable (and probably useful) class even if you hate the subject with a passion. Use the TAs, make friends in the class who know what they're doing, and try to avoid using the late days for as long as possible. To conclude, an actual quote from Prof. Balkcom (one of the profs who filled in): \"Computer science is not about computers.\" And another: \"Time is simulated by robots that are ripples in a pond.\" (I don't know about his computer science skills, but I can confirm that he is absolutely incredible at mixing metaphors.)",
          },
          {
            id: "23984723984",
            termCode: "22W",
            professor: "Vasanta Lakshmi Kommineni",
            content:
              "As others have said, we had Vasanta for the first three weeks before she had a family emergency. She was amazing. Really wonderful. I personally loved Campbell, one of the fill-in profs, and thought he did a really good job keeping people engaged and explaining complex topics really well. He made sure to watch for questions and make sure people really understood the answers. Balkcom was not great. Jayanti was bad. Didn't answer any questions, and when he did he gave the vaguest possible answers. One of which was just \"the code worked because we believed\". Literally what. The short assignments are definitely not easy, but I think they're a pretty fair assessment of what we talked about in class. Towards the end I sometimes needed one or two questions answered by TAs, but in general they weren't bad. The exams I thought were also really fair. They were remote, open note, and more importantly open Pycharm, meaning we could test all of our code before we submitted the exam, so we knew whether or not it worked and could check for bugs during it. The lab assignments, however, did not feel like a good test of our knowledge. After the first one, we were given little to no explanation in class about them, and they were way too difficult. Completing them just became all about whether or not you could be the first or second one into office hours, otherwise you'd sit in zoom rooms for hours waiting to be helped. By the end the TAs would pretty much just give us the code because there literally wasn't enough time for them to explain to us how to do it. Some of the TAs were amazing, and I absolutely loved them. Some of them would just not show up to their hours, or give five minutes warning that they were cancelling. All this being said, it is an A median class and for the most part if you go to TA hours and do the assignments you will do well. But it is hours of your life every week, and I found it incredibly stressful. Really think about your other classes and whether you can NRO it before you take it.",
          },
        ],
      },
      similarCourses: [
        {
          id: "5481622",
          name: "(a new) COSC001: Introduction to Programming and Computation ",
          lastOffered: "22G",
          description:
            "This course introduces computational concepts that are fundamental to computer science and are useful for the sciences, social sciences, engineering, and digital arts. Students will write their own interactive programs to analyze data, process text, draw graphics, manipulate images, and simulate physical systems. Problem decomposition, program efficiency, and good programming style are emphasized throughout the course. No prior programming experience is assumed.",
          orcLink:
            "http://dartmouth.smartcatalogiq.com/en/current/orc/Departments-Programs-Undergraduate/Computer-Science/COSC-Computer-Science-Undergraduate/COSC-1",
          qualityScore: 230924,
          layupScore: -234834,
          medians: [
            { termCode: "22W", medianGrade: "D" },
            { termCode: "21F", medianGrade: "A" },
            { termCode: "21S", medianGrade: "D" },
          ],
          reviews: [],
        },
      ],
    },
    revalidate: REGENERATION_HOURS * 60 * 60, // seconds
  };
};

export default Course;
