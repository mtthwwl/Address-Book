const form = document.querySelector('form');
const trHead = document.querySelector('#head');
const conData = document.querySelector('#data');
const nameInput = document.querySelector('#name');
const addressInput = document.querySelector('#address');
const phoneInput = document.querySelector('#phone');
const emailInput = document.querySelector('#email');
const urlInput = document.querySelector('#website');
const button = document.querySelector('button');

let db ;

window.onload = () => {
    
    let request = window.indexedDB.open('contacts', 1);

    // Fix 1: Correct typo 'oneerror' to 'onerror'
    request.onerror = () => {
        console.log('Database failed to open');
    };

    request.onsuccess = () => {
        console.log('Database opened successfully');
        db = request.result;

        form.onsubmit = (e) => {
            e.preventDefault();
            let newItem = { 
                name: nameInput.value,
                address: addressInput.value,
                phone: phoneInput.value,
                email: emailInput.value,
                url: urlInput.value
            };
        
            if (db.objectStoreNames.contains('contacts')) {
                let transaction = db.transaction(['contacts'], 'readwrite');
                let objectStore = transaction.objectStore('contacts');
                var request = objectStore.add(newItem);
        
                request.onsuccess = () => {
                    console.log('Item added to database');
                    // Clear input fields
                    nameInput.value = '';
                    addressInput.value = '';
                    phoneInput.value = '';
                    emailInput.value = '';
                    urlInput.value = '';
                };
        
                request.onerror = () => {
                    console.log('Item not added to database');
                };
        
                // Fix 3: Refresh data after transaction completes
                transaction.oncomplete = () => {
                    console.log('Transaction completed');
                    displayData(); // Update the display
                };
            } else {
                console.log("Object store 'contacts' does not exist");
            }
        };

        displayData();
    };

    request.onupgradeneeded = (e) => {
        let db = e.target.result;
        let objectStore = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });

        objectStore.createIndex('name', 'name', { unique: true });
        objectStore.createIndex('address', 'address', { unique: false });
        objectStore.createIndex('phone', 'phone', { unique: false });
        objectStore.createIndex('email', 'email', { unique: true });
        objectStore.createIndex('url', 'url', { unique: false });

        console.log('Database setup complete');
    };

    function displayData() {
        if (!db.objectStoreNames.contains('contacts')) {
            console.error('Contacts object store does not exist');
            conData.innerHTML = '<p>Contacts database not initialized</p>';
            db.createObjectStore('contacts', { keyPath: 'id' });
            return;
        }

        // Fix 2: Clear existing table content
        conData.innerHTML = '';

        const transaction = db.transaction('contacts', 'readonly');
        const objectStore = transaction.objectStore('contacts');


        objectStore.openCursor().onsuccess = (e) => {
            let cursor = e.target.result;
            if (cursor) {
                let tr = document.createElement('tr');
                let tdName = document.createElement('td');
                let tdAddress = document.createElement('td');
                let tdPhone = document.createElement('td');
                let tdEmail = document.createElement('td');
                let tdUrl = document.createElement('td');

                tdName.textContent = cursor.value.name;
                tdAddress.textContent = cursor.value.address;
                tdPhone.textContent = cursor.value.phone;
                tdEmail.textContent = cursor.value.email;
                tdUrl.textContent = cursor.value.url;

                tr.appendChild(tdName);
                tr.appendChild(tdAddress);
                tr.appendChild(tdPhone);
                tr.appendChild(tdEmail);
                tr.appendChild(tdUrl);

                // Fix 4: Create a TD for the delete button
                let tdAction = document.createElement('td');
                let deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.setAttribute('data-contact-id', cursor.value.id);
                deleteBtn.addEventListener('click', deleteItem);
                tdAction.appendChild(deleteBtn);
                tr.appendChild(tdAction);

                conData.appendChild(tr);

                cursor.continue();
            } else {
                if (!conData.firstChild) {
                    let para = document.createElement('p');
                    para.textContent = 'No contacts found';
                    conData.appendChild(para);
                }
              //  console.log('No more data to display');
            }
        };
    }

    function deleteItem(e) {
        let id = Number(e.target.getAttribute('data-contact-id'));
        let objectStore = db.transaction('contacts', 'readwrite').objectStore('contacts');
        let request = objectStore.delete(id);
    
        request.onsuccess = () => {
            console.log('Item deleted from database');
            displayData(); // Refresh the display
        };
    
        request.onerror = () => {
            console.log('Item not deleted from database');
        };
    }
};