import { baseApiUrl, statusCode } from '../shared/config.js';
import AppError from '../shared/error.js';

class HttpClient {

    async request(endpoint, method, header, data) {
        try {
            const response = await fetch(`${baseApiUrl}/${endpoint}`, {
                method: method,
                headers: header,
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (!response.ok) {
                alert(responseData.message);
                throw new AppError(responseData.message, response.status);
            }

            return responseData;
        } catch (error) {
            throw new AppError(`Error: ${error.message}`, statusCode.internalServerError);
        }
    }
}

export default HttpClient;