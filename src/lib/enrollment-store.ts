import { create } from "zustand";

import {
  students as initialStudents,
  courses as initialCourses,
  enrollments as initialEnrollments,
} from "@/lib/mock-data";
import type { Course, Student} from "@/lib/types";
import { persist } from "zustand/middleware";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];
  /** Admin ลงทะเบียนวิชาให้นักศึกษาคนใดก็ได้ (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  enroll: (studentId: string, courseId: string) => void;
  /** Admin ยกเลิกการลงทะเบียนของนักศึกษาคนใดก็ได้ */
  drop: (studentId: string, courseId: string) => void;
  /** เพิ่มวิชาใหม่ */
  addCourse: (course: Course) => void;
  /**ลบผู้สอน */
  removeInstructor: (courseCode: string, instructorName: string) => void;
  /** ลบนักศึกษา พร้อมการลงทะเบียนทั้งหมดของคนนั้น */
  removeStudent: (studentId: string) => void;
  /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  removeCourse: (courseId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(

persist(
    (set) => ({
  students: initialStudents,
  courses: initialCourses,
  enrollments: initialEnrollments,

  enroll: (studentId, courseCode) =>
    set((state) => ({
      students: state.students.map((student) => {
        if (studentId.includes(student.studentId)) {
          const currentCourses = student.enrolledCourses || [];
          if (!currentCourses.includes(courseCode)) {
            return {
              ...student,
              enrolledCourses: [...currentCourses, courseCode],
            };
          }
        }
        return student;
      }),
    })),

  drop: (studentId, courseCode) =>
    set((state) => ({
      students: state.students.map((student) => {
        if (student.studentId === studentId) {
          return {
            ...student,
            enrolledCourses: (student.enrolledCourses || []).filter(
              (code) => code !== courseCode
            ),
          };
        }
        return student;
      }),
    })),

  addCourse: (newCourse) =>
        set((state) => ({
          courses: [...state.courses, newCourse],
        })),  
  
  removeInstructor: (courseCode, instructorName) =>
        set((state) => ({
          courses: state.courses.map((course) => {
          if (course.courseCode === courseCode) {
          return {
            ...course,
            instructors: course.instructors?.filter((t) => t !== instructorName),
          };
        }
        return course;
        }),
      })),

  removeStudent: (studentId) =>
    set((state) => ({
      students: state.students.filter((s) => s.studentId !== studentId),
    })),
    // set((state) => ({
    //   students: state.students.filter((s) => s.studentId !== studentId),
    //   enrollments: state.enrollments.filter((e) => e.studentId !== studentId),
    // })),
    

  removeCourse: (courseCode) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.courseCode !== courseCode),
      students: state.students.map((student) => ({
        ...student,
        enrolledCourses: (student.enrolledCourses || []).filter(
          (code) => code !== courseCode
        ),
      })),
    })),
    // set((state) => ({
    //   courses: state.courses.filter((c) => c.courseCode !== courseId),
    //   enrollments: state.enrollments.filter((e) => e.courseId !== courseId),
    // })),
    
}),
    {
      name: "lab16-2569-670610354",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),

);
