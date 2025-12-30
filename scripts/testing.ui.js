// Testing tab UI logic


export function resetCache() {
    alert('Cache reset triggered.');
}
export function resetSessionStorage() {
    alert('Session Storage reset triggered.');
}
export function resetLocalStorage() {
    alert('Local Storage reset triggered.');
}
export function resetCloudStorage() {
    alert('Cloud Storage reset triggered.');
}

window.resetCache = resetCache;
window.resetSessionStorage = resetSessionStorage;
window.resetLocalStorage = resetLocalStorage;
window.resetCloudStorage = resetCloudStorage;

// Attach button handlers on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    const resetCacheBtn = document.getElementById('resetCacheBtn');
    const resetSessionStorageBtn = document.getElementById('resetSessionStorageBtn');
    const resetLocalStorageBtn = document.getElementById('resetLocalStorageBtn');
    const resetCloudStorageBtn = document.getElementById('resetCloudStorageBtn');
    if (resetCacheBtn) resetCacheBtn.onclick = resetCache;
    if (resetSessionStorageBtn) resetSessionStorageBtn.onclick = resetSessionStorage;
    if (resetLocalStorageBtn) resetLocalStorageBtn.onclick = resetLocalStorage;
    if (resetCloudStorageBtn) resetCloudStorageBtn.onclick = resetCloudStorage;
});
