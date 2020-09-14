function setData(key, data) {
    const storage = JSON.stringify(data);
    if (!data || data.length !== 0) {
        localStorage.setItem(key, storage);
    }
}

function getData(key) {
    let data = [];
    const storage = localStorage.getItem(key);
    try {
        data = JSON.parse(storage);
    } catch (error) {
        console.error(error);
    }

    return data;
}

export { setData, getData };