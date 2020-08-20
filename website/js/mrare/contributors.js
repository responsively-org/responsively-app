var json = '';
var html = '';

function profileHtmlString(to, title, style) {
    return `<a href="${to}" title="${title}" target="_blank" class="github-contributors__avatar" style="${style}">&nbsp;</a>`;
}

function generateProfile(c) {
    var to = `https://github.com/${c.login}`;
    var title = `${c.contributions} contributions from ${c.login}`;
    var style = `background-image: url('${c.avatar_url}&s=64');`;
    html += profileHtmlString(to, title, style);
}

function getContributorAmount() {
    return json.length;
}

function generateFooterRow() {
    document.getElementById('github-contributors__thanks').innerText = `Thanks to all of our ${getContributorAmount()} contributors!`;
    for (var i = 0; i < json.length; i++) {
        generateProfile(json[i]);
    }
    document.getElementById('github-contributors__users').innerHTML = html;
}

async function getContr() {
    fetch('https://api.github.com/repos/responsively-org/responsively-app/contributors', {
        method: 'GET',
        headers: {
            'User-Agent': 'responsively-app/website',
        },
    })
        .then((response) => response.text())
        .then((text) => json = JSON.parse(text))
        .then((json) => generateFooterRow())
        .catch((err) => console.error(err));
}

getContr();
