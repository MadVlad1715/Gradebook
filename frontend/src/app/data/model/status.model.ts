export interface Status {
  status: boolean;
  httpStatus: number;
  message?: string;
  [propName: string]: any;
}
