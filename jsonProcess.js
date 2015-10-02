function jsonRequest(jsonFileName) {

    var request = new XMLHttpRequest();

    if (jsonRequest.clicks == undefined) {
        jsonRequest.clicks = 0;
    }
    request.onreadystatechange = function (e) {
        if (request.readyState === 4 && request.status === 200) {
            data = JSON.parse(request.responseText);
            UpdateInfoTable(data);
        }
    };
    request.open('GET', jsonFileName, true);
    request.send();
};

function UpdateInfoTable(data) {
    UpdateItemByKey(data, 'title', UpdateTopItemsDomElement);
    UpdateItemByKey(data, 'countryName', UpdateTopCountriesDomElement);
    AddClicksToGlobe(data);
};

function UpdateItemByKey(data, key, updateFunction) {

    var items = {};
    for (var i = 0; i < data.data.length; i++) {
        var itemTitle = data.data[i][key];
        if (items.hasOwnProperty(itemTitle)) {
            items[itemTitle].value++;
        }
        else {
            items[itemTitle] = {
                'value': 1,
                'img': data.data[i].thumbnailUrl
            }
        }
    }
    ;
    var sortedItems = SortItemsByClicks(items);
    updateFunction(sortedItems);

}

function SortItemsByClicks(items, key) {
    var sortedItems = [];
    for (var item in items) {
        sortedItems.push({
            'key': item,
            'value': items[item].value,
            'img': items[item].img
        });
    }
    sortedItems.sort(function (a, b) {
        return b.value - a.value;
    });

    return sortedItems;
}

function UpdateTopItemsDomElement(sortedItems) {

    document.getElementById('itemClickLogo1').getElementsByTagName('img')[0].src = sortedItems[0].img;
    document.getElementById('itemClickLogo2').getElementsByTagName('img')[0].src = sortedItems[1].img;
    document.getElementById('itemClickLogo3').getElementsByTagName('img')[0].src = sortedItems[2].img;

    document.getElementById('itemTitle1').innerHTML = sortedItems[0].key;
    document.getElementById('itemTitle2').innerHTML = sortedItems[1].key;
    document.getElementById('itemTitle3').innerHTML = sortedItems[2].key;

    document.getElementById('itemClicks1').innerHTML = sortedItems[0].value;
    document.getElementById('itemClicks2').innerHTML = sortedItems[1].value;
    document.getElementById('itemClicks3').innerHTML = sortedItems[2].value;
}

function UpdateTopCountriesDomElement(sortedItems) {
//
//    document.getElementById("country1").innerHTML = sortedItems[0].key;
//    document.getElementById("country2").innerHTML = sortedItems[1].key;
//    document.getElementById("country3").innerHTML = sortedItems[2].key;
//
//    document.getElementById("countryClicks1").innerHTML = sortedItems[0].value;
//    document.getElementById("countryClicks2").innerHTML = sortedItems[1].value;
//    document.getElementById("countryClicks3").innerHTML = sortedItems[2].value;
}

function AddClicksToGlobe(data) {

    var left = 0;
    var right = parseInt(data.data.length / 60);
    var interval = right;

    var intervalID = window.setInterval(function () {
        for (var j = left; j < right && right < data.data.length; j++) {
            globe.AddClick(data.data[j]);
        }
        jsonRequest.clicks += interval;
        document.getElementById("numberOfClicks").innerHTML = jsonRequest.clicks;
        if (right >= data.data.length) {
            clearInterval(intervalID);
        }
        else {
            left = right;
            right += interval;
        }

    }, 1000);

}

function addZero(time) {
    if (time < 10) {
        time = "0" + time;
    }
    return time;
}