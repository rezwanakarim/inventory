document.addEventListener('DOMContentLoaded', function () {
    const tagForm = document.getElementById('tag-form');
    const typeForm = document.getElementById('type-form');
    const productForm = document.getElementById('inventory-form');
    const customerForm = document.getElementById('customer-form');
    const tagSelect = document.getElementById('product-tags');
    const typeSelect = document.getElementById('product-type');
    const filterTags = document.getElementById('filter-tags');
    const filterTypes = document.getElementById('filter-types');
    const filterProductName = document.getElementById('filter-product-name');
    const inventoryList = document.getElementById('inventory-list');
    const customerList = document.getElementById('customer-list');
    const cartList = document.getElementById('cart-list');
    const checkoutButton = document.getElementById('checkout-button');
    const tagList = document.getElementById('tag-list');
    const typeList = document.getElementById('type-list');
    const customerOrdersList = document.getElementById('customer-orders-list');
    const orderDateInput = document.getElementById('order-date');
    document.getElementById('export-inventory').addEventListener('click', exportInventoryToExcel);

document.getElementById('export-customers').addEventListener('click', exportCustomersToExcel);


    let cart = [];

    tagForm.addEventListener('submit', addTag);
    typeForm.addEventListener('submit', addType);
    productForm.addEventListener('submit', addProduct);
    customerForm.addEventListener('submit', addCustomer);
    inventoryList.addEventListener('click', handleInventoryListClick);
    customerList.addEventListener('click', removeCustomer);
    tagList.addEventListener('click', removeTag);
    typeList.addEventListener('click', removeType);
    filterTags.addEventListener('change', filterProducts);
    filterTypes.addEventListener('change', filterProducts);
    filterProductName.addEventListener('input', filterProducts);
    checkoutButton.addEventListener('click', checkout);

    displayTags();
    displayTypes();
    displayFilterTags();
    displayFilterTypes();
    displayInventory();
    displayCustomers();
    displayCart();
    displayCustomerOrders();

    function addTag(e) {
        e.preventDefault();
        const tagName = document.getElementById('tag-name').value;
        let tags = getTags();
        tags.push(tagName);
        saveTags(tags);
        displayTags();
        displayFilterTags();
        tagForm.reset();
    }

    function addType(e) {
        e.preventDefault();
        const typeName = document.getElementById('type-name').value;
        let types = getTypes();
        types.push(typeName);
        saveTypes(types);
        displayTypes();
        displayFilterTypes();
        typeForm.reset();
    }

    function addProduct(e) {
        e.preventDefault();
        const productName = document.getElementById('product-name').value;
        const productQuantity = parseInt(document.getElementById('product-quantity').value);
        const selectedTags = Array.from(tagSelect.selectedOptions).map(option => option.value);
        const productType = typeSelect.value;

        let inventory = getInventory();
        let existingProduct = inventory.find(product =>
            product.name === productName &&
            product.type === productType &&
            selectedTags.every(tag => product.tags.includes(tag)) &&
            product.tags.length === selectedTags.length
        );

        if (existingProduct) {
            existingProduct.quantity += productQuantity;
        } else {
            const product = {
                name: productName,
                quantity: productQuantity,
                tags: selectedTags,
                type: productType
            };
            inventory.push(product);
        }

        saveInventory(inventory);
        displayInventory();
        productForm.reset();
    }

    function handleInventoryListClick(e) {
        if (e.target.classList.contains('remove')) {
            const index = e.target.getAttribute('data-index');
            let inventory = getInventory();
            inventory.splice(index, 1);
            saveInventory(inventory);
            displayInventory();
        } else if (e.target.classList.contains('add-to-cart')) {
            const index = e.target.getAttribute('data-index');
            const quantity = parseInt(prompt('Enter quantity to add to cart:', '1'));
            if (!isNaN(quantity) && quantity > 0) {
                addToCart(index, quantity);
            }
        }
    }

    function addCustomer(e) {
        e.preventDefault();
        const name = document.getElementById('customer-name').value;
        const address = document.getElementById('customer-address').value;
        const mobile = document.getElementById('customer-mobile').value;

        const customer = {
            name,
            address,
            mobile
        };

        let customers = getCustomers();
        customers.push(customer);
        saveCustomers(customers);

        displayCustomers();
        customerForm.reset();
    }

    function removeCustomer(e) {
        if (e.target.classList.contains('remove')) {
            const index = e.target.getAttribute('data-index');
            let customers = getCustomers();
            customers.splice(index, 1);
            saveCustomers(customers);
            displayCustomers();
        }
    }

    function removeTag(e) {
        if (e.target.classList.contains('remove')) {
            const index = e.target.getAttribute('data-index');
            let tags = getTags();
            tags.splice(index, 1);
            saveTags(tags);
            displayTags();
            displayFilterTags();
        }
    }

    function removeType(e) {
        if (e.target.classList.contains('remove')) {
            const index = e.target.getAttribute('data-index');
            let types = getTypes();
            types.splice(index, 1);
            saveTypes(types);
            displayTypes();
            displayFilterTypes();
        }
    }

    function filterProducts() {
        const selectedTag = filterTags.value;
        const selectedType = filterTypes.value;
        const filterName = filterProductName.value.toLowerCase();
        displayInventory(selectedTag, selectedType, filterName);
    }

    function getTags() {
        const tags = localStorage.getItem('tags');
        return tags ? JSON.parse(tags) : [];
    }

    function saveTags(tags) {
        localStorage.setItem('tags', JSON.stringify(tags));
    }

    function displayTags() {
        tagSelect.innerHTML = '';
        tagList.innerHTML = '';
        let tags = getTags();
        tags.forEach((tag, index) => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            tagSelect.appendChild(option);

            const div = document.createElement('div');
            div.className = 'tag';
            div.innerHTML = `
                <span>${tag}</span>
                <button class="remove" data-index="${index}">Remove</button>
            `;
            tagList.appendChild(div);
        });
    }

    function displayFilterTags() {
        filterTags.innerHTML = '<option value="">All</option>';
        let tags = getTags();
        tags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            filterTags.appendChild(option);
        });
    }

    function getTypes() {
        const types = localStorage.getItem('types');
        return types ? JSON.parse(types) : [];
    }

    function saveTypes(types) {
        localStorage.setItem('types', JSON.stringify(types));
    }

    function displayTypes() {
        typeSelect.innerHTML = '';
        typeList.innerHTML = '';
        let types = getTypes();
        types.forEach((type, index) => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);

            const div = document.createElement('div');
            div.className = 'type';
            div.innerHTML = `
                <span>${type}</span>
                <button class="remove" data-index="${index}">Remove</button>
            `;
            typeList.appendChild(div);
        });
    }

    function displayFilterTypes() {
        filterTypes.innerHTML = '<option value="">All</option>';
        let types = getTypes();
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            filterTypes.appendChild(option);
        });
    }

    function getInventory() {
        const inventory = localStorage.getItem('inventory');
        return inventory ? JSON.parse(inventory) : [];
    }

    function saveInventory(inventory) {
        localStorage.setItem('inventory', JSON.stringify(inventory));
    }

    function displayInventory(filterTag = '', filterType = '', filterName = '') {
        inventoryList.innerHTML = '';
        let inventory = getInventory();
        inventory = inventory.filter(product => 
            (filterTag === '' || product.tags.includes(filterTag)) &&
            (filterType === '' || product.type === filterType) &&
            (filterName === '' || product.name.toLowerCase().includes(filterName))
        );

        inventory.forEach((product, index) => {
            const div = document.createElement('div');
            div.className = 'product';
            div.innerHTML = `
                <span>${product.name} - Quantity: ${product.quantity} - Type: ${product.type} - Tags: ${product.tags.join(', ')}</span>
                <button class="add-to-cart" data-index="${index}">Add to Cart</button>
                <button class="remove" data-index="${index}">Remove</button>
            `;
            inventoryList.appendChild(div);
        });
    }

    function addToCart(index, quantity) {
        let inventory = getInventory();
        const product = inventory[index];
        const cartItem = cart.find(item => item.name === product.name && item.type === product.type && item.tags.every(tag => product.tags.includes(tag)) && item.tags.length === product.tags.length);

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        displayCart();
    }

    function displayCart() {
        cartList.innerHTML = '';
        cart.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name} - Quantity: ${item.quantity} - Type: ${item.type} - Tags: ${item.tags.join(', ')}</span>
                <button class="remove-from-cart" data-index="${index}">Remove</button>
            `;
            cartList.appendChild(div);
        });
    }

    function getCustomers() {
        const customers = localStorage.getItem('customers');
        return customers ? JSON.parse(customers) : [];
    }

    function saveCustomers(customers) {
        localStorage.setItem('customers', JSON.stringify(customers));
    }

    function displayCustomers() {
        customerList.innerHTML = '';
        let customers = getCustomers();
        customers.forEach((customer, index) => {
            const div = document.createElement('div');
            div.className = 'customer';
            div.innerHTML = `
                <span>${customer.name} - Address: ${customer.address} - Mobile: ${customer.mobile}</span>
                <button class="remove" data-index="${index}">Remove</button>
            `;
            customerList.appendChild(div);
        });
    }

    function checkout() {
        const customerName = prompt('Enter customer name:');
        const customers = getCustomers();
        const customer = customers.find(c => c.name === customerName);

        if (!customer) {
            alert('Customer not found');
            return;
        }

        const orderDate = orderDateInput.value || new Date().toISOString().split('T')[0];

        const order = {
            date: orderDate,
            customer,
            items: cart
        };

        let orders = getCustomerOrders();
        orders.push(order);
        saveCustomerOrders(orders);

        let inventory = getInventory();
        cart.forEach(cartItem => {
            let product = inventory.find(p => p.name === cartItem.name && p.type === cartItem.type && p.tags.every(tag => cartItem.tags.includes(tag)) && p.tags.length === cartItem.tags.length);
            if (product) {
                product.quantity -= cartItem.quantity;
            }
        });
        saveInventory(inventory);

        cart = [];
        displayCart();
        displayInventory();
        displayCustomerOrders();
        alert('Order placed successfully! Check the Customer Orders section for details.');
    }

    function getCustomerOrders() {
        const orders = localStorage.getItem('customerOrders');
        return orders ? JSON.parse(orders) : [];
    }

    function saveCustomerOrders(orders) {
        localStorage.setItem('customerOrders', JSON.stringify(orders));
    }

    function displayCustomerOrders() {
        customerOrdersList.innerHTML = '';
        let orders = getCustomerOrders();
        orders.forEach(order => {
            const div = document.createElement('div');
            div.className = 'order';
            div.innerHTML = `
                <h3>Order Date: ${order.date}</h3>
                <h4>Customer: ${order.customer.name}</h4>
                <p>Address: ${order.customer.address}</p>
                <p>Mobile: ${order.customer.mobile}</p>
                <h4>Items:</h4>
                <ul>
                    ${order.items.map(item => `<li>${item.name} - Quantity: ${item.quantity} - Type: ${item.type} - Tags: ${item.tags.join(', ')}</li>`).join('')}
                </ul>
            `;
            customerOrdersList.appendChild(div);
        });
    }

    function exportToExcel(data, filename) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, filename);
    }
    
    function exportInventoryToExcel() {
        const inventory = getInventory();
        exportToExcel(inventory, 'inventory.xlsx');
    }
    
    
    
    function exportCustomersToExcel() {
        const customers = getCustomers();
        exportToExcel(customers, 'customers.xlsx');
    }
    
});
