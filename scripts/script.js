wordy = {};
wordy.synonyms = new Set;
wordy.list = new Set;

wordy.init = function() {
    console.log('init');
    wordy.events();
    $('#keywords').jQCloud([], {
        fontSize: ['30px', '28px', '26px', '24px', '22px', '20px', '18px', '16px'],
        autoResize: true, 
        classPattern: null,
        colors: ['#A26DFB', '#5014B6', '#3A1674', '#6D1BF9', 'rebeccapurple', '#846CAD', '#004A8F', 'darkorchid'],
        });
    $('#wordList').jQCloud([], {
        fontSize: ['30px', '28px', '26px', '24px', '22px', '20px', '18px', '16px'],
        autoResize: true,
        classPattern: null,
        colors: ['#A26DFB', '#5014B6', '#3A1674', '#6D1BF9', 'rebeccapurple', '#846CAD', '#004A8F', 'darkorchid'],
    });
};  

wordy.getWordsAPI = function (word) {
    console.log('getAPI');
    // gets synonyms of word from Oxford API via proxy 
    return $.ajax({
        url: 'http://proxy.hackeryou.com',
        dataType: 'json',
        method: 'GET',
        data: {
            reqUrl: `https://od-api.oxforddictionaries.com:443/api/v1/entries/en/${word}/synonyms`,
            proxyHeaders: {
                app_key: '4fd2cfaf6774febb6e528d009474ea2e',
                app_id: '4bba9821',
                Accept: 'application/json'
            },
            xmlToJSON: false
        }
    });
};

wordy.getSynonyms = async function(word) {
    console.log('getSynonyms');
    // waits for API then adds synonyms to a set so there are no repeats 
    if (word) {
        const synResult = await wordy.getWordsAPI(word);
        const results = synResult.results[0].lexicalEntries[0].entries[0].senses[0].synonyms;
        console.log('getSynonyms word is ',word);
        // const results = ['cat', 'dog', 'cow', 'monkey'];
        results.forEach(function (result){
            wordy.synonyms.add(result.text);
            // wordy.synonyms.add(result);
        });
        if (wordy.synonyms) {
            wordy.synonyms.add(word);
            wordy.makeWordCloud(wordy.synonyms);
            // wordy.events();
        }
    }
};

wordy.makeWordCloud = function(words) {
    console.log('makeWordCloud');
    //create an array of objects to use jQCloud plugin on
    const wordArray = [];
    words.forEach(function (synonym) {
        const randoWeight = Math.floor(Math.random() * 13);
        wordArray.push({
            text: `${synonym}`, weight: `${randoWeight}`});
    });
    $('#keywords').jQCloud('update', wordArray);
    wordy.events();
    };

wordy.makeList = function() {
    console.log('makeList');
    //make list of the words you've chosen so far
    $('#wordList').empty();
    wordy.list.forEach(function (listWord) {
        $('#wordList').append(`<li>${listWord}</li>`);
    })
}

// wordy.makeGlobalCloud = function () {
//     let words = [];
//     for (let mood in wordy.globalMoods) {
//         words.push({ text: `${mood}`, weight: wordy.globalMoods[mood]});
//     }
//     $('#global').jQCloud('update', words);
// };

wordy.events = function () {
    console.log('events');
    $('form').on('submit', function (e) {
        console.log('form submit');
        // when someone enters their own emotion, get gif and synonyms
        e.preventDefault();
        const userInput = $('input').val();
        if (userInput) {
            wordy.getSynonyms(String(userInput));
            wordy.list.add(userInput);
            wordy.makeList();
        }
        $(this).trigger('reset');
    });

    $('#keywords').find('span').on('click', function () {
        console.log('span click');
    // when an emotion is clicked from the word cloud, add to list and get more synonyms
        const spanWord = $(this).text();
        console.log('span click userWord is', spanWord);
        // wordy.getSynonyms1(mood);
        wordy.list.add(spanWord);
        wordy.makeList();
        wordy.getSynonyms(spanWord);
    });

    $('.restart').on('click', function() {
        window.location = '';
    });    
};

$(wordy.init());
