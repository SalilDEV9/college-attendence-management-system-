
import { User, Course, AttendanceRecord, CourseEnrollment, Role, AttendanceStatus } from '../types';

export const MOCK_USERS: User[] = [
    { id: 1, name: 'Dr. Evelyn Reed', email: 'e.reed@university.edu', role: Role.Admin },
    { id: 2, name: 'Prof. Alan Grant', email: 'a.grant@university.edu', role: Role.Teacher },
    { id: 3, name: 'John Hammond', email: 'j.hammond@university.edu', role: Role.Student },
    { id: 4, name: 'Ellie Sattler', email: 'e.sattler@university.edu', role: Role.Student },
    { id: 5, name: 'Ian Malcolm', email: 'i.malcolm@university.edu', role: Role.Student },
    { id: 6, name: 'Robert Muldoon', email: 'r.muldoon@university.edu', role: Role.Pending },
    { id: 7, name: 'Prof. Sarah Harding', email: 's.harding@university.edu', role: Role.Teacher },
    { id: 8, name: 'Lex Murphy', email: 'l.murphy@university.edu', role: Role.Student },
    { id: 9, name: 'Tim Murphy', email: 't.murphy@university.edu', role: Role.Student },
];

export const MOCK_COURSES: Course[] = [
    { id: 101, name: 'Introduction to Paleontology', department: 'Biology', teacherId: 2 },
    { id: 102, name: 'Chaos Theory and Ecosystems', department: 'Mathematics', teacherId: 7 },
    { id: 103, name: 'Advanced Genetics', department: 'Biology', teacherId: 2 },
];

export const MOCK_ENROLLMENTS: CourseEnrollment[] = [
    { id: 1, courseId: 101, studentId: 3 },
    { id: 2, courseId: 101, studentId: 4 },
    { id: 3, courseId: 101, studentId: 5 },
    { id: 4, courseId: 102, studentId: 5 },
    { id: 5, courseId: 102, studentId: 8 },
    { id: 6, courseId: 102, studentId: 9 },
    { id: 7, courseId: 103, studentId: 3 },
    { id: 8, courseId: 103, studentId: 4 },
];

const generateAttendance = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    let recordId = 1;
    const today = new Date();
    MOCK_ENROLLMENTS.forEach(enrollment => {
        for (let i = 0; i < 10; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const randomStatus = Math.random();
            let status: AttendanceStatus;
            if (randomStatus < 0.8) {
                status = AttendanceStatus.Present;
            } else if (randomStatus < 0.95) {
                status = AttendanceStatus.Absent;
            } else {
                status = AttendanceStatus.Late;
            }

            records.push({
                id: recordId++,
                courseId: enrollment.courseId,
                studentId: enrollment.studentId,
                date: dateString,
                status: status,
            });
        }
    });
    return records;
};

export const MOCK_ATTENDANCE: AttendanceRecord[] = generateAttendance();
