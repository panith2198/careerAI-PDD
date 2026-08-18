import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: Number(__ENV.VUS || 100),
  duration: __ENV.DURATION || '1m',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

const API_ORIGIN = __ENV.API_ORIGIN || 'https://careerai-api.welcos.in';

export default function () {
  const response = http.get(`${API_ORIGIN}/health`);
  check(response, {
    'health returned 200': (res) => res.status === 200,
    'database connected': (res) => String(res.body).includes('"database":"connected"'),
  });
  sleep(1);
}
