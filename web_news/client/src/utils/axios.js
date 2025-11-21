import axios from "axios";

// Configure axios to send credentials (cookies) with all requests
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "http://localhost:8800/api";

export default axios;

