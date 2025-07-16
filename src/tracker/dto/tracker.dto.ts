export class TrackerDto {
  method: string;
  operation: string;
  headers: any;
  queryParams?: any;
  token?: string;
  responseBody?: any;
  error?: string;
  statusCode?: number
}
