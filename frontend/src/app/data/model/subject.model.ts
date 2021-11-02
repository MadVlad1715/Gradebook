export interface Subject {
  id: number,
  name: string,
  teacherId: number | null,
  teacherName: string | null,
  lastEditTime: number | null,
  creationTime: number
}
