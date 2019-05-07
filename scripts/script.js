wordy = {};
wordy.globalMoods = {};
wordy.synonyms = new Set;

wordy.init = function() {
    // wordy.dbMoods();
    wordy.events();
    $('#keywords').jQCloud([], {
        fontSize: ['30px', '28px', '26px', '24px', '22px', '20px', '18px', '16px'],
        autoResize: true, 
        classPattern: null,
        colors: ['#A26DFB', '#5014B6', '#3A1674', '#6D1BF9', 'rebeccapurple', '#846CAD', '#004A8F', 'darkorchid'],
        });
    $('#global').jQCloud([], {
        fontSize: ['30px', '28px', '26px', '24px', '22px', '20px', '18px', '16px'],
        autoResize: true,
        classPattern: null,
        colors: ['#A26DFB', '#5014B6', '#3A1674', '#6D1BF9', 'rebeccapurple', '#846CAD', '#004A8F', 'darkorchid'],
    });
};  

// wordy.dbMoods = function() {
//     dbwordy.on('value', (snapshot) => {
//         let moods = snapshot.val();  
//         for (let mood in moods) {
//             // add to global moods from DB 
//             wordy.globalMoods[mood] = moods[mood];
//         }
//     });
// };

wordy.getWords = function (emotion) {
    // gets synonyms of emotion from Oxford API via proxy 
    return $.ajax({
        url: 'http://proxy.hackeryou.com',
        dataType: 'json',
        method: 'GET',
        data: {
            reqUrl: `https://od-api.oxforddictionaries.com:443/api/v1/entries/en/${emotion}/synonyms`,
            proxyHeaders: {
                app_key: '4fd2cfaf6774febb6e528d009474ea2e',
                app_id: '4bba9821',
                Accept: 'application/json'
            },
            xmlToJSON: false
        }
    });
};

wordy.getSynonyms = async function(emotion) {
    // waits for API then adds synonyms to a set so there are no repeats 
    const synResult = await wordy.getWords(emotion);
    const results = synResult.results[0].lexicalEntries[0].entries[0].senses[0].synonyms;
    results.forEach(function (result){
        wordy.synonyms.add(result.text);
    });
    if (wordy.synonyms) {
        wordy.synonyms.add(emotion);
        wordy.makeWordCloud(wordy.synonyms);
        wordy.events();
    }
};

wordy.makeWordCloud = function(words) {
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

// wordy.makeGlobalCloud = function () {
//     let words = [];
//     for (let mood in wordy.globalMoods) {
//         words.push({ text: `${mood}`, weight: wordy.globalMoods[mood]});
//     }
//     $('#global').jQCloud('update', words);
// };

wordy.bckgrndColor = function (lightColor, darkColor) {
    let body = document.getElementById('body');
    body.style.background = `radial-gradient(${lightColor}, ${darkColor})`;
};

wordy.toggleHidden = function (element) {
    $(element).toggleClass('hidden');
};

wordy.getEmotion = function(word) {
    // takes an word and gets a gif from Giphy API and synonyms of the word from Oxford API
    if (word) {
        // wordy.getGiphy(word);
        wordy.getSynonyms(word);
    }
};

wordy.updateDB = function (mood) {
    // adds mood to globalMoods, then updates database
    if (mood) {
        if (wordy.globalMoods[mood] > 0) {
            wordy.globalMoods[mood] += 1;
        } else {
            wordy.globalMoods[mood] = 1;
        }
        dbwordy.set(wordy.globalMoods);
    }
;}

wordy.events = function () {
    // when an emotion is clicked from the landing page, 
    // hides landing page section and un-hides cloud and gif section
    $('.emotion').on('click', function() {
        const mood = $(this).text();
        wordy.toggleHidden('.landingPage');
        wordy.toggleHidden('.cloudAndGif');
        wordy.getEmotion(mood);

    });

    $('#keywords').find('span').on('click', function () {
    // when an emotion is clicked from the word cloud, gets a gif and more synonyms
        const mood = $(this).text();
        wordy.getEmotion(mood);
    });

    $('c').on('submit', function (e) {
        // when someone enters their own word, get synonyms
        e.preventDefault();
        const userWord = $('input').val();
        wordy.getEmotion(String(userWord));
        $(this).trigger('reset');
        wordy.updateDB(userWord);
    });

    $('.restart').on('click', function() {
        window.location = '';
    });

    let backToggle = true;
    // toggles text of global button between see global and back
    $('.globalButton').on('click', function () {
        wordy.makeGlobalCloud();
        wordy.toggleHidden('#keywords');
        wordy.toggleHidden('#iframe');
        wordy.toggleHidden('.global');
        wordy.toggleHidden('form');
        wordy.toggleHidden('.newGif');
        if (backToggle) {
            $(this).text('back');
            backToggle = false;
        } else {
            $(this).text('global');
            backToggle = true;
        }
    });
    
};

$(wordy.init());
