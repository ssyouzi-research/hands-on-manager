
export async function users(courseId: string) {
    const response = await fetch(`/api/findByEmail?course_id=${courseId}`);
    const data = await response.json();
    if (data.role === 'student') {
        return {
            'role': data.role,
            'users': [
                data
            ]
        }
    } else if (data.role === 'instructor') {
        const users = [ data ];
        users.push(...await listUsersByCourse(courseId));
        return {
            'role': data.role,
            'users': users
        }
    }
}

export async function listUsersByCourse(courseId: string) {
    const response = await fetch(`/api/students?course_id=${courseId}`);
    const data = await response.json();
    return data;
}

export async function console(rolearn: string) {
    const response = await fetch(`/api/console?rolearn=${rolearn}`);
    const json = await response.json();
    return json.location;
}

export async function profile() {
    const response = await fetch(`/api/profile`);
    const data = await response.json();
    return data;
}
