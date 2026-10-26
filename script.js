const searchForm = document.querySelector('#searchForm');
const searchInput = document.querySelector('#searchInput');
const WordElement = document.querySelector('#word');
const PronunciationElement = document.querySelector('#pronunciation');
const DefinitionElement = document.querySelector('#definitionText');
const audioElement= document.querySelector('#audio');

async function fetchWordData(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (response.status === 404) {
        return null;
    }
    if (!response.ok) {
        throw new Error(`Dictionary request failed (${response.status})`);
    }

    const data = await response.json();
    const entry = Array.isArray(data) ? data[0] : null;
    if (!entry || typeof entry.word !== 'string') {
        throw new Error('Dictionary returned an unexpected response');
    }
    return entry;
}
function displayWordData(data) {
    WordElement.textContent = data.word;
    PronunciationElement.textContent = data.phonetic
        || data.phonetics?.find(phonetic => phonetic.text)?.text
        || 'N/A';
    const definition = data.meanings
        ?.find(meaning => meaning.definitions?.length)
        ?.definitions[0]?.definition;
    DefinitionElement.textContent = definition || 'N/A';

    const audiourl = data.phonetics?.find(phonetic => phonetic.audio)?.audio;
    if (audiourl) {
        audioElement.src = audiourl;
        audioElement.hidden = false;
    } else {
        audioElement.removeAttribute('src');
        audioElement.hidden = true;
    }
}

async function handleSearch(event) {
    event.preventDefault();
    const word = searchInput.value.trim();
    if (word) {
        try {
            const data = await fetchWordData(word);
            if (data) {
                displayWordData(data);
                return;
            }
            WordElement.textContent = 'Word not found';
            PronunciationElement.textContent = '';
            DefinitionElement.textContent = '';
            audioElement.removeAttribute('src');
            audioElement.hidden = true;
        } catch (error) {
            console.error(error);
            WordElement.textContent = 'Unable to load word';
            PronunciationElement.textContent = '';
            DefinitionElement.textContent = 'Please check your connection and try again.';
            audioElement.removeAttribute('src');
            audioElement.hidden = true;
        }
    }
}

searchForm.addEventListener('submit', handleSearch);    
