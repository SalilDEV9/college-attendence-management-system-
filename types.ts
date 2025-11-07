
export enum Role {
    Admin = 'admin',
    Teacher = 'teacher',
    Student = 'student',
    Pending = 'pending'
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}

export interface Course {
    id: number;
    name: string;
    department: string;
    teacherId: number;
}

export enum AttendanceStatus {
    Present = 'present',
    Absent = 'absent',
    Late = 'late'
}

export interface AttendanceRecord {
    id: number;
    courseId: number;
    studentId: number;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
}

export interface CourseEnrollment {
    id: number;
    courseId: number;
    studentId: number;
}
