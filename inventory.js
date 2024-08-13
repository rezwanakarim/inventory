document.addEventListener('DOMContentLoaded', () => {
    displayInventory();
  
    document.getElementById('export-inventory').addEventListener('click', exportInventoryToExcel);
    document.getElementById('import-inventory').addEventListener('change', importInventory);

    function importInventory() {
        const fileInput = document.getElementById('import-inventory');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file.');
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            if (file.name.endsWith('.csv')) {
                // Handle CSV file
                const contents = e.target.result;
                const csvData = parseCSV(contents);
                mergeAndSaveInventory(csvData);
            } else if (file.name.endsWith('.xlsx')) {
                // Handle XLSX file
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                parseAndSaveData(jsonData);
            } else {
                alert('Unsupported file format.');
            }
        };

        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx')) {
            reader.readAsArrayBuffer(file);
        }
    }

    function parseCSV(csv) {
        const rows = csv.split('\n').map(row => row.split(','));
        // Skip the header row
        rows.shift();

        return rows.map(row => {
            return {
                name: row[0],
                quantity: parseInt(row[1], 10),
                type: row[2],
                tags: row[3] ? row[3].split(';') : []
            };
        });
    }

    function parseAndSaveData(data) {
        // Skip the header row
        data.shift();

        const parsedData = data.map(row => {
            return {
                name: row[0],
                quantity: parseInt(row[1], 10),
                type: row[2],
                tags: row[3] ? row[3].split(';') : []
            };
        });

        mergeAndSaveInventory(parsedData);
    }

    function mergeAndSaveInventory(newInventory) {
        // Get existing inventory and merge with new import
        const currentInventory = getInventory();

        // Create a Set of existing product names to check for duplicates
        const existingProductNames = new Set(currentInventory.map(product => product.name.toLowerCase()));

        // Filter out duplicates from newInventory
        const uniqueNewInventory = newInventory.filter(product => !existingProductNames.has(product.name.toLowerCase()));

        // Combine the unique new inventory with the current inventory
        const updatedInventory = currentInventory.concat(uniqueNewInventory);

        saveInventory(updatedInventory);
        displayInventory();
    }

    function saveInventory(inventory) {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }

    function displayInventory(filterTag = '', filterType = '', filterName = '') {
        const inventoryList = document.getElementById('inventory-list');
        inventoryList.innerHTML = ''; // Clear existing content

        let inventory = getInventory();
        inventory = inventory.filter(product =>
            (filterTag === '' || product.tags.includes(filterTag)) &&
            (filterType === '' || product.type === filterType) &&
            (filterName === '' || product.name.toLowerCase().includes(filterName.toLowerCase()))
        );

        inventory.forEach((product, index) => {
            const row = document.createElement('tr'); // Create a table row

            // Create and append individual table data cells
            const nameCell = document.createElement('td');
            nameCell.textContent = product.name;
            row.appendChild(nameCell);

            const quantityCell = document.createElement('td');
            quantityCell.textContent = product.quantity;
            row.appendChild(quantityCell);

            const typeCell = document.createElement('td');
            typeCell.textContent = product.type;
            row.appendChild(typeCell);

            const tagsCell = document.createElement('td');
            tagsCell.textContent = product.tags.join(', ');
            row.appendChild(tagsCell);

            const actionsCell = document.createElement('td');
            actionsCell.innerHTML = `
            <button class="add-to-cart" data-index="${index}">Add to Cart</button>
            <button class="remove" data-index="${index}">Remove</button>
        `;
            row.appendChild(actionsCell);

            inventoryList.appendChild(row);
        });
    }

    function getInventory() {
        const inventory = localStorage.getItem('inventory');
        return inventory ? JSON.parse(inventory) : [];
    }

    function exportInventoryToExcel() {
        const inventory = getInventory();
        const csvContent = "data:text/csv;charset=utf-8,"
            + ["Product Name,Quantity,Type,Tags"]
                .concat(inventory.map(product =>
                    [product.name, product.quantity, product.type, product.tags.join(', ')].join(',')
                ))
                .join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


});