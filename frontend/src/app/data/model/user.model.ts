export interface IUser {
  login: string;
  status: number;
  first_name: string;
  last_name: string;
  patronymic: string | null;
  classroom_teacher?: string[];
  group?: string;
}

export class User implements IUser {

  public login: string;
  public status: number;
  public first_name: string;
  public last_name: string;
  public patronymic: string | null;
  public classroom_teacher?: string[];
  public group?: string;

  constructor (data: IUser) {
    this.login = data.login;
    this.status = data.status;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.patronymic = data.patronymic;
    this.classroom_teacher = data.classroom_teacher;
    this.group = data.group;

    //this.login = '12345678901234567890'
    //this.first_name = '12345678901234567890'
    //this.last_name = '12345678901234567890'
  }

  public get statusString(): string {
    let status: string[] = [];

    if (this.isAdmin) status.push('адміністратор');
    if (this.isTeacher) status.push('вчитель');
    if (this.isStudent) status.push('студент');
    if (!status.length) return '';

    let status_name = status.join(', ');
    return status_name.charAt(0).toUpperCase() + status_name.slice(1);
  }

  public get isAdmin(): boolean {
    return (this.status & 1) !== 0
  }

  public get isTeacher(): boolean {
    return (this.status & 2) !== 0
  }

  public get isStudent(): boolean {
    return (this.status & 4) !== 0
  }
}
