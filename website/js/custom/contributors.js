const populateContributors = () => {
  function profileHtmlString(to, title, style) {
    return `<a href="${to}" title="${title}" target="_blank" class="github-contributors__avatar" style="${style}">&nbsp;</a>`;
  }

  function generateProfile(c) {
    const to = `https://github.com/${c.login}`;
    const title = `${c.contributions} contributions from ${c.login}`;
    const style = `background-image: url('${c.avatar_url}&s=96');`;
    return profileHtmlString(to, title, style);
  }

  function generateFooterRow(json) {
    if (json == null || !json.length) {
      throw new Error('Malformed data');
    }
    const humanContributors = json.filter((contributor) => contributor.type === "User");
    let html = '';
    document.getElementById(
      'github-contributors__thanks',
    ).innerText = `Thanks to all of our ${humanContributors.length} contributors! 🎉👏`;
    humanContributors.forEach((contributor) => {
      html += generateProfile(contributor);
    });
    document.getElementById('github-contributors__users').innerHTML = html;
  }

  function getContr() {
    fetch(
      'https://api.github.com/repos/responsively-org/responsively-app/contributors?per_page=100',
    )
      .then((response) => response.text())
      .then((text) => JSON.parse(text))
      .then((json) => generateFooterRow(json))
      .catch(() => { });
  }

  getContr();
};

export default populateContributors;
