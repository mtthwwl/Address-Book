const form = document.querySelector('form');
const thead = document.querySelector('thead');
const name = document.querySelector('#name');
const comData = document.querySelector('#data');
const addressInput = document.querySelector('#address');
const phoneInput = document.querySelector('#phone');
const emailInput = document.querySelector('#email');
const urlInput = document.querySelector('#website');
const button = document.querySelector('button');

window.onload = () => {
    let request = window.indexedDB.open('contacts', 1);
}