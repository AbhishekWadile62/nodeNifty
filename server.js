const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public','index.html'));
});
app.get('/favicon.ico', (req, res) => res.status(204));


// Function to fetch cookies
async function fetchCookie(url, userAgent) {
    try {
        const response = await axios.get(url, {
            headers: {
                'Referer': url,
                'User-Agent': userAgent,
                'Accept': 'text/html; charset=utf-8',
                'Accept-Language': 'en-us,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate'
            }
        });

        const setCookieHeader = response.headers['set-cookie'];
        let nsitCookie = '';
        let nseappidCookie = '';

        if (setCookieHeader) {
            setCookieHeader.forEach(cookie => {
                const [key, value] = cookie.split(';')[0].split('=');
                if (key === 'nsit') {
                    nsitCookie = `${key}=${value}`;
                } else if (key === 'nseappid') {
                    nseappidCookie = `${key}=${value}`;
                }
            });
        }

        const joinedCookies = `${nsitCookie}; ${nseappidCookie}`;
        return joinedCookies;
    } catch (error) {
        console.error('Error fetching cookie:', error.message);
        throw error;
    }
}

// Function to fetch the option chain data using the cookies
async function fetchOptionChain(cookies, expiryDate) {
    const url = `https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY&expiryDate=${encodeURIComponent(expiryDate)}`; // Update URL with expiryDate

    try {
        const response = await axios.get(url, {
            headers: {
                'Cookie': cookies,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.nseindia.com/option-chain',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching option chain:', error.message);
        throw error;
    }
}

// Endpoint to get expiry dates
app.get('/get-expiry-dates', async (req, res) => {
    const cookieUrl = 'https://www.nseindia.com/option-chain';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

    try {
        const cookies = await fetchCookie(cookieUrl, userAgent);
        const optionChainData = await fetchOptionChain(cookies, ''); // Fetch initial data to get expiry dates
        const expiryDates = optionChainData.records.expiryDates; // Modify path according to actual data
        res.json({ expiryDates });
    } catch (error) {
        res.status(500).send('Error fetching expiry dates');
    }
});

app.get('/get-option-chain', async (req, res) => {
    const cookieUrl = 'https://www.nseindia.com/option-chain';
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    const expiryDate = req.query.expiryDate;

    try {
        const cookies = await fetchCookie(cookieUrl, userAgent);
        const optionChainData = await fetchOptionChain(cookies, expiryDate);

        console.log('Backend Option Chain Data:', optionChainData); // Debug output

        res.json(optionChainData);
    } catch (error) {
        res.status(500).send('Error fetching option chain data');
    }
});
// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
