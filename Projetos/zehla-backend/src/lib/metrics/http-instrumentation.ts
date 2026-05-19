import { apiMetrics } from './api-metrics';


export function instrumentHttp(
  method: string,
  route: string,
  statusCode: number,
  durationSeconds: number
) {
  apiMetrics.httpRequests.inc({ method, route, status_code: statusCode.toString() });
  apiMetrics.httpDuration.observe({ method, route }, durationSeconds);
}
