const form = document.querySelector('form');
const thead = document.querySelector('thead');
const nameInput = document.querySelector('#name');
const conData = document.querySelector('#data');
const addressInput = document.querySelector('#address');
const phoneInput = document.querySelector('#phone');
const emailInput = document.querySelector('#email');
const urlInput = document.querySelector('#website');
const button = document.querySelector('button');

window.onload = () => {
    let request = window.indexedDB.open('contacts', 1);
    
    request.onerror = () =>{
        console.log('Database failed to open');
    };

    request.onesuccess = () =>{
        console.log('Database opened successfully');
        db = request.result;

        form.onsubmit = (e) => {
            e.preventDefault();
            let newItem = {
                name: nameInput.value, 
                adress: addressInput.value,
                phone: phoneInput.value,
                email: emailInput.value,
                url: urlInput.value
            };
    
            let transaction = db.transaction(['contacts'], 'readwrite');
            let objectStore = transaction.objectStore('contacts');
            var request = objectStore.add(newItem);
    
            request.onesuccess = () =>{
                console.log('Item added to database');
                nameInput.value = "";
                addressInput.value = "";
                phoneInput.value = "";
                emailInput.value = "";
                urlInput.value = "";
            }
    
            request.oneerror = () =>{
                console.log('Item not added to database');
            }
    
            request.onecomplete = () =>{
                console.log('Transaction completed');
                displayData();
            }
        }
        displayData();
    };

    request.onupgradeneeded = (e) => {
        let db = e.target.result;
        let objectStore = db.createObjectStore('contacts', {keyPath: 'id', autoincrement: true});

        objectStore.createindex('name', 'name', {unique: true});
        objectStore.createindex('adress', 'adress', {unique: false});
        objectStore.createindex('phone', 'phone', {unique: false});
        objectStore.createindex('email', 'email', {unique: true});
        objectStore.createindex('url', 'url', {unique: false});

        console.log('Database setup complete');
    };

    function displayData(){
        if(!db.objectStoreNames.contains('contacts')){
            console.error('Contacts object store does not exist');
            conData.innerHTML= '<p>No contacts in database</p>';
            db.createObjectStore('contacts', {keyPath: 'id'});
            return;
        };

        conData.innerHTML = '';

        const transaction = db.transaction('contacts', 'readonly');
        const objectStore = transaction.objectStore('contacts');

        objectStore.openCursor().onesuccess = (e) =>{
            let cursor = e.target.result;

            if (cursor){
                let tr = document.createElement('tr');

                let tdName = document.createElement('td');
                let tdAdress = document.createElement('td');
                let tdPhone = document.createElement('td');
                let tdEmail = document.createElement('td');
                let tdUrl = document.createElement('td');

                tdName.textContent = cursor.value.name;
                tdAdress.textContent = cursor.value.address;
                tdPhone.textContent = cursor.value.phone;
                tdEmail.textContent = cursor.value.email;
                tdUrl.textContent = cursor.value.url;

                tr.appendChild(tdName);
                tr.appendChild(tdAdress);
                tr.appendChild(tdPhone);
                tr.appendChild(tdEmail);
                tr.appendChild(tdUrl);

                let tdAction = document.createElement('td');
                let deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.setAttribute('data-contact-id', cursor.value.id);
                deleteBtn.addEventListener('click', deleteItem);
                tdAction.appendChild(deleteBtn);
                tr.appendChild(tdAction);

                conData.appendChild(tr);

                cursor.continue();
            } else{
                if(!conData.firstChild){
                    let para = document.createElement('p');
                    para.textContent = 'No contacts found';
                    conData.appendChild(para);
                };
            };
        };
    };

    function deleteItem(e){
        let id = Number(e.target.getAttribute('data-contact-id'));
        let objectStore = db.transaction('contacts', 'readwrite').objectStore('contacts');
        let request = objectStore.delete(id);

        request.onesuccess = () =>{
            console.log('Item deleted from database');
            displayData();
        };

        request.oneerror = () =>{
            console.log('Item not deleted from database');
        };
    };
};

