document.addEventListener('DOMContentLoaded', function() {
    fetchExpiryDates();

    document.getElementById('expiryDates').addEventListener('change', function() {
        const selectedExpiryDate = this.value;
        if (selectedExpiryDate) {
            console.log('Selected Expiry Date:', selectedExpiryDate); // Debug output
            fetchOptionChain(selectedExpiryDate);
        }
    });

    document.getElementById('getOptionChainButton').addEventListener('click', function() {
        const selectedExpiryDate = document.getElementById('expiryDates').value;
        if (selectedExpiryDate) {
            console.log('Button Click - Selected Expiry Date:', selectedExpiryDate); // Debug output
            fetchOptionChain(selectedExpiryDate);
        } else {
            console.error('No expiry date selected.');
        }
    });
});
let refreshIntervalId;

document.getElementById('startRefreshBtn').addEventListener('click', function() {
    const selectedExpiryDate = document.getElementById('expiryDates').value;
    if (!refreshIntervalId && selectedExpiryDate) {
        fetchOptionChain(selectedExpiryDate); // Fetch immediately before setting the interval
        refreshIntervalId = setInterval(() => {
            fetchOptionChain(selectedExpiryDate);
        }, 60000); // 60000 ms = 1 minute
        console.log('Live refresh started.');
    } else if (!selectedExpiryDate) {
        console.error('No expiry date selected.');
    }
});

document.getElementById('stopRefreshBtn').addEventListener('click', function() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
        console.log('Live refresh stopped.');
    }
});
function fetchExpiryDates() {
    fetch('/get-expiry-dates')
        .then(response => response.json())
        .then(data => {
            const expiryDatesDropdown = document.getElementById('expiryDates');
            expiryDatesDropdown.innerHTML = ''; // Clear existing options

            // Populate dropdown with expiry dates
            data.expiryDates.forEach(date => {
                const option = document.createElement('option');
                option.value = date;
                option.textContent = date;
                expiryDatesDropdown.appendChild(option);
            });

            console.log('Fetched Expiry Dates:', data);
        })
        .catch(error => {
            console.error('Error fetching expiry dates:', error);
        });
}


function populateExpiryDropdown(expiryDates) {
    const expirySelect = document.getElementById('expiryDates');
    if (!expirySelect) {
        console.error('Dropdown menu with ID "expiryDates" not found.');
        return;
    }
    expirySelect.innerHTML = ''; // Clear existing options

    expiryDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        expirySelect.appendChild(option);
    });
}

function fetchOptionChain(expiryDate) {
    fetch(`/get-option-chain?expiryDate=${encodeURIComponent(expiryDate)}`)
        .then(response => response.json())
        .then(optionChainData => {
            console.log('Fetched Option Chain Data:', optionChainData); // Debug output
            displayOptionChain(optionChainData);
        })
        .catch(error => {
            console.error('Error fetching option chain data:', error);
        });
}

function displayOptionChain(data, selectedExpiryDate) {
    const tableContainer = document.getElementById('optionChainTable');
    tableContainer.innerHTML = ''; // Clear previous data

    if (!data || !data.filtered || !data.filtered.data) {
        console.error('No data available for display');
        return;
    }

    const filteredData = data.filtered.data;
    const underlyingValue = data.records.underlyingValue;

    if (filteredData.length === 0) {
        tableContainer.innerHTML = `<p>No data available for the selected expiry date (${selectedExpiryDate}).</p>`;
        return;
    }

    let totalCallVolume = 0;
    let totalCallOI = 0;
    let totalCallChgOI = 0;
    let totalCallBidQty = 0;
    let totalCallAskQty = 0;

    let totalPutVolume = 0;
    let totalPutOI = 0;
    let totalPutChgOI = 0;
    let totalPutBidQty = 0;
    let totalPutAskQty = 0;

    const table = document.createElement('table');
    table.border = '1';

    const headerRow = document.createElement('tr');
    const headers = [
        'Total Buy Qty', 'Total Sell Qty', 'Volume', 'OI', 'Chg OI', 
        'Chg OI %', 'IV', 'LTP', 'LTP Chg', 'LTP Chg %', 'BidQty', 'BidPrice', 
        'AskPrice', 'AskQty', 'Strike', 'AskQty', 'AskPrice', 'BidPrice', 
        'BidQty', 'Ltp Chg %', 'LTP Chg', 'LTP', 'IV', 'Chg OI %', 'Chg OI', 
        'OI', 'Volume', 'Total Sell Qty', 'Total Buy Qty'
    ];
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    table.appendChild(headerRow);

    filteredData.forEach(record => {
        const row = document.createElement('tr');

        const strikePrice = record.strikePrice;

        const isCallATMOTM = strikePrice >= underlyingValue;
        const isPutATMOTM = strikePrice <= underlyingValue;

        const callData = record.CE || {};
        row.appendChild(createCell(callData.totalBuyQuantity));
        row.appendChild(createCell(callData.totalSellQuantity));
        row.appendChild(createCell(callData.totalTradedVolume));
        row.appendChild(createCell(callData.openInterest));
        row.appendChild(createCell(callData.changeinOpenInterest));
        row.appendChild(createCell(callData.pchangeinOpenInterest));
        row.appendChild(createCell(callData.impliedVolatility));
        row.appendChild(createCell(callData.lastPrice));
        row.appendChild(createCell(callData.change));
        row.appendChild(createCell(callData.pChange));
        row.appendChild(createCell(callData.bidQty));
        row.appendChild(createCell(callData.bidprice));
        row.appendChild(createCell(callData.askPrice));
        row.appendChild(createCell(callData.askQty));
        const strikePriceCell = document.createElement('td');
        strikePriceCell.textContent = strikePrice;
        row.appendChild(strikePriceCell);

        const putData = record.PE || {};
        row.appendChild(createCell(putData.askQty));
        row.appendChild(createCell(putData.askPrice));
        row.appendChild(createCell(putData.bidprice));
        row.appendChild(createCell(putData.bidQty));
        row.appendChild(createCell(putData.pChange));
        row.appendChild(createCell(putData.change));
        row.appendChild(createCell(putData.lastPrice));
        row.appendChild(createCell(putData.impliedVolatility));
        row.appendChild(createCell(putData.pchangeinOpenInterest));
        row.appendChild(createCell(putData.changeinOpenInterest));
        row.appendChild(createCell(putData.openInterest));
        row.appendChild(createCell(putData.totalTradedVolume));
        row.appendChild(createCell(putData.totalSellQuantity));
        row.appendChild(createCell(putData.totalBuyQuantity));

        table.appendChild(row);

        if (isCallATMOTM) {
            totalCallVolume += callData.totalTradedVolume || 0;
            totalCallOI += callData.openInterest || 0;
            totalCallChgOI += callData.changeinOpenInterest || 0;
            totalCallBidQty += callData.bidQty || 0;
            totalCallAskQty += callData.askQty || 0;
        }

        if (isPutATMOTM) {
            totalPutVolume += putData.totalTradedVolume || 0;
            totalPutOI += putData.openInterest || 0;
            totalPutChgOI += putData.changeinOpenInterest || 0;
            totalPutBidQty += putData.bidQty || 0;
            totalPutAskQty += putData.askQty || 0;
        }
    });

    const footerRow = document.createElement('tr');

    for (let i = 0; i < 2; i++) {
        footerRow.appendChild(document.createElement('td'));
    }

    footerRow.appendChild(createCell(totalCallVolume));
    footerRow.appendChild(createCell(totalCallOI));
    footerRow.appendChild(createCell(totalCallChgOI));
    for (let i = 0; i < 5; i++) {
        footerRow.appendChild(document.createElement('td'));
    }
    footerRow.appendChild(createCell(totalCallBidQty));
    footerRow.appendChild(document.createElement('td'));
    footerRow.appendChild(document.createElement('td'));
    footerRow.appendChild(createCell(totalCallAskQty));
    footerRow.appendChild(createCell('TOTAL')); // Empty column to balance

    footerRow.appendChild(createCell(totalPutAskQty));
    footerRow.appendChild(document.createElement('td')); // Skip AskPrice
    footerRow.appendChild(document.createElement('td')); // Skip BidPrice
    footerRow.appendChild(createCell(totalPutBidQty));
    for (let i = 0; i < 5; i++) {
        footerRow.appendChild(document.createElement('td'));
    }
    footerRow.appendChild(createCell(totalPutChgOI));
    footerRow.appendChild(createCell(totalPutOI));
    footerRow.appendChild(createCell(totalPutVolume));

    table.appendChild(footerRow);
    tableContainer.appendChild(table);
    const copyrightContainer = document.createElement('div');
    copyrightContainer.style.textAlign = 'center';
    copyrightContainer.style.marginTop = '30px';
    const copyright = document.createElement('span');
    copyright.textContent = '© hehe copyright (duplicate)';
    copyrightContainer.appendChild(copyright);

    tableContainer.appendChild(copyrightContainer);
}


function createCell(value) {
    const cell = document.createElement('td');
    if (typeof value === 'number') {
        cell.textContent = value.toFixed(2); // Limit to 2 decimal places
    } else {
        cell.textContent = value !== undefined && value !== null ? value : 'N/A';
    }
    return cell;
}

