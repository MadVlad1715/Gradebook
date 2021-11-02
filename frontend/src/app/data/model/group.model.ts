export interface Group {
  id: number,
  name: string,
  classroomTeacher: string | null,
  studentsCount: number,
  subjectsCount: number,
  creationTime: string
}
