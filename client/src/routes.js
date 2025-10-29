import Admin from "./pages/admin/adminDashboard";
import Teacher from "./pages/teacher/teacherDashboard";
import Student from "./pages/student/studentDashboard";
import Login from "./pages/auth/login";
import {ADMIN_ROUTE, TEACHER_ROUTE, STUDENT_ROUTE, LOGIN_ROUTE} from "./utils/consts";

export const authRoutes = [
    {
        path: ADMIN_ROUTE,
        Component: Admin,
        role: 'admin'
    },
    {
        path: TEACHER_ROUTE,
        Component: Teacher,
        role: 'teacher'
    },
    {
        path: STUDENT_ROUTE,
        Component: Student,
        role: 'student'
    }
];

export const publicRoutes = [
    {
        path: LOGIN_ROUTE,
        Component: Login
    }
];