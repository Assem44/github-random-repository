const langsEl = document.getElementById("langs")
const resultContainer = document.querySelector(".founded-data .content");
const refreshBtn = document.getElementById("refresh")
const retryBtn = document.getElementById("retry")
const statePhrases = {
    "selection": "Please, select a language",
    "loading": "Loading, please wait...",
    "error": "Error fetching repositories"
}
function updateState(state) {
    resultContainer.classList.remove("error", "init");
    refreshBtn.classList.add("hidden");
    retryBtn.classList.add("hidden");

    switch (state) {
        case 'loading':
            resultContainer.classList.add("init");
            resultContainer.innerHTML = statePhrases.loading;
            break;
        case 'error':
            resultContainer.classList.add("error");
            resultContainer.textContent = statePhrases.error;
            retryBtn.classList.remove("hidden");
            break;
        case 'selection':
            resultContainer.classList.add("init");
            resultContainer.innerHTML = statePhrases.selection;
            break;
        case 'success':
            refreshBtn.classList.remove("hidden");
            break;
    }
}
async function getFetchData(url) {
    try {
        const r = await fetch(url);
        if (!r.ok) throw new Error("Connection Error");
        return await r.json();
    } catch (err) {
        return null;
    }
}
async function getLanguages() {
    const url = "https://raw.githubusercontent.com/kamranahmedse/githunt/master/src/components/filters/language-filter/languages.json"
    const langs = await getFetchData(url)
    if (langs) {
        for (const item of langs) {
            const option = document.createElement('option')
            option.value = item.value
            option.textContent = item.title
            langsEl.appendChild(option)
        }
    }
}
async function fetchRandomRepo(lang) {
    if (!lang) return null;
    const url = `https://api.github.com/search/repositories?q=language:${lang}`
    // returns an object 
    const data = await getFetchData(url)
    
    if (!data || !data.items) {
        return null
    }

    const randomIndex = Math.trunc(Math.random() * data.items.length)
    return data.items[randomIndex] || ''
}
function displayRepo(repo) {
    const description = repo.description || "No description available"
    resultContainer.innerHTML = `
        <h3 class="repo-name">
        ${repo.name}
        </h3>
        <p class="repo-description" title="${description}">
        ${description}
        </p>

        <div class="repo-info">
        <span class="language">
                ${repo.language}
            </span>
            <span class="stars">
                <i class="fa-solid fa-star" style="color: #ffc107;"></i>
                ${repo.stargazers_count}
                </span>
            <span class="forks">
                <i class="fa-solid fa-code-branch"></i>
                ${repo.forks_count}
            </span>
            <span class="issues">
                <i class="fa fa-circle-exclamation"></i>
                ${repo.open_issues_count}
            </span>
        </div>
    `;
}
async function discoverRandomRepo() {
    if (!langsEl.value) {
        updateState("selection")
        return;
    }
    updateState("loading")
    const randomRepo = await fetchRandomRepo(langsEl.value)
    if (!randomRepo) {
        updateState("error")
    } else {
        updateState("success")
        displayRepo(randomRepo)
    }
}
langsEl.addEventListener("change", discoverRandomRepo)
refreshBtn.addEventListener("click", discoverRandomRepo)
retryBtn.addEventListener("click", discoverRandomRepo)
getLanguages()