document.addEventListener('DOMContentLoaded', function () {
    const orderCustomerFilter = document.getElementById('order-customer-filter');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const filterOrdersButton = document.getElementById('filter-orders-button');
    const orderList = document.getElementById('order-list');
    document.getElementById('export-customer-orders').addEventListener('click', exportCustomerOrdersToExcel);

    function getCustomerOrders() {
        const orders = localStorage.getItem('customerOrders');
        return orders ? JSON.parse(orders) : [];
    }

    function saveCustomerOrders(orders) {
        localStorage.setItem('customerOrders', JSON.stringify(orders));
    }

    function displayOrders(filterCustomer = '', startDate = '', endDate = '') {
        orderList.innerHTML = '';
        let orders = getCustomerOrders();

        if (filterCustomer) {
            orders = orders.filter(order => order.customer.name === filterCustomer);
        }

        if (startDate) {
            orders = orders.filter(order => new Date(order.date) >= new Date(startDate));
        }

        if (endDate) {
            orders = orders.filter(order => new Date(order.date) <= new Date(endDate));
        }

        orders.forEach((order, index) => {
            const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const div = document.createElement('div');
            div.className = 'order';
            div.innerHTML = `
                <h3>Order Date: ${order.date}</h3>
                <h4>Customer Information</h4>
                <p>Name: ${order.customer.name}</p>
                <p>Address: ${order.customer.address}</p>
                <p>Mobile: ${order.customer.mobile}</p>
                <p>Total Quantity: ${totalQuantity}</p>
                <h4>Items:</h4>
                <ul>
                    ${order.items.map(item => `<li>${item.name} - Quantity: ${item.quantity} - Type: ${item.type} - Tags: ${item.tags.join(', ')}</li>`).join('')}
                </ul>
                <button class="remove-order" data-index="${index}">Remove Order</button>
            `;
            orderList.appendChild(div);
        });

        // Add event listeners for the remove buttons
        document.querySelectorAll('.remove-order').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                removeOrder(index);
            });
        });
    }

    function populateCustomerFilter() {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        orderCustomerFilter.innerHTML = '<option value="">All</option>';
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.name;
            option.textContent = customer.name;
            orderCustomerFilter.appendChild(option);
        });
    }

    function removeOrder(index) {
        let orders = getCustomerOrders();
        orders.splice(index, 1);
        saveCustomerOrders(orders);
        displayOrders(orderCustomerFilter.value, startDateInput.value, endDateInput.value);
    }

    filterOrdersButton.addEventListener('click', () => {
        const selectedCustomer = orderCustomerFilter.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        displayOrders(selectedCustomer, startDate, endDate);
    });

    populateCustomerFilter();
    displayOrders();

    function exportToExcel(data, filename) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, filename);
    }

    function exportCustomerOrdersToExcel() {
        const orders = getCustomerOrders();
        const formattedOrders = orders.map(order => {
            return {
                'Order Date': order.date,
                'Customer Name': order.customer.name,
                'Customer Address': order.customer.address,
                'Customer Mobile': order.customer.mobile,
                'Items': order.items.map(item => `${item.name} - Quantity: ${item.quantity} - Type: ${item.type} - Tags: ${item.tags.join(', ')}`).join('; ')
            };
        });
        exportToExcel(formattedOrders, 'customer_orders.xlsx');
    }
    
});
