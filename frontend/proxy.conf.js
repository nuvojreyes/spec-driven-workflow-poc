/**
 * Dev-server proxy for the API.
 *
 * The frontend always calls the same-origin path `/api`, so no component ever
 * knows a host and the backend needs no CORS handling. Only the target moves:
 *
 *   local            (default) http://127.0.0.1:8000
 *   docker compose   API_TARGET=http://backend:8000  — inside the network the
 *                    backend is a service name, and 127.0.0.1 would be the
 *                    frontend container itself
 *   other port       API_TARGET=http://127.0.0.1:8001
 */
const target = process.env['API_TARGET'] || 'http://127.0.0.1:8000';

module.exports = {
	'/api': {
		target,
		secure: false,
		changeOrigin: false,
		logLevel: 'info',
	},
};
