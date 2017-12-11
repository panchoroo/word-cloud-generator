// Initialize Firebase
var config = {
    apiKey: "AIzaSyB7aBVzri5bUZIA-CdT8F8z8qbX7eAkNaw",
    authDomain: "learning-firebase-43e6b.firebaseapp.com",
    databaseURL: "https://learning-firebase-43e6b.firebaseio.com",
    projectId: "learning-firebase-43e6b",
    storageBucket: "",
    messagingSenderId: "707941547891"
};
firebase.initializeApp(config);
const dbMoody = firebase.database().ref('/moody');

moody = {};
moody.globalMoods = {};
moody.synonyms = new Set;

moody.init = function() {
    moody.dbMoods();
    moody.events();
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

moody.dbMoods = function() {
    dbMoody.on('value', (snapshot) => {
        let moods = snapshot.val();  
        for (let mood in moods) {
            // add to global moods from DB 
            moody.globalMoods[mood] = moods[mood];
        }
    });
};

moody.getGiphy = function(query) {    
    $.ajax({
        // passes query into the url template string and searches giffy for matching gifs
        method: 'GET',
        dataType: 'json',
        url: `https://api.giphy.com/v1/gifs/search?api_key=9w1Q6T6BTyWdHRmjP6835ydDi0Kb3HnD&q=${query}&limit=25&offset=0&rating=G&lang=en`
        })
        .then(function(giphyRes) {
            moody.currentMoodGifs = giphyRes.data;
            moody.getNewGif(moody.currentMoodGifs);
        });
};

moody.getNewGif = function (currentMoodGifs) {   
    // gets a new random gif
    const randoIndex = Math.floor(Math.random() * currentMoodGifs.length);
    $('iframe').attr('src', 'https://giphy.com/embed/' + currentMoodGifs[randoIndex].id);
};

moody.getWords = function (emotion) {
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

moody.getSynonyms = async function(emotion) {
    // waits for API then adds synonyms to a set so there are no repeats 
    const synResult = await moody.getWords(emotion);
    const results = synResult.results[0].lexicalEntries[0].entries[0].senses[0].synonyms;
    results.forEach(function (result){
        moody.synonyms.add(result.text);
    });
    if (moody.synonyms) {
        moody.synonyms.add(emotion);
        moody.makeWordCloud(moody.synonyms);
        moody.events();
    }
};

moody.makeWordCloud = function(words) {
    //create an array of objects to use jQCloud plugin on
    const wordArray = [];
    words.forEach(function (synonym) {
        const randoWeight = Math.floor(Math.random() * 13);
        wordArray.push({
            text: `${synonym}`, weight: `${randoWeight}`});
    });
    $('#keywords').jQCloud('update', wordArray);
    moody.events();
    };

moody.makeGlobalCloud = function () {
    let words = [];
    for (let mood in moody.globalMoods) {
        words.push({ text: `${mood}`, weight: moody.globalMoods[mood]});
    }
    $('#global').jQCloud('update', words);
};

moody.bckgrndColor = function (lightColor, darkColor) {
    let body = document.getElementById('body');
    body.style.background = `radial-gradient(${lightColor}, ${darkColor})`;
};

moody.toggleHidden = function (element) {
    $(element).toggleClass('hidden');
};

moody.getEmotion = function(emotion) {
    // takes an emotion and gets a gif from Giphy API and synonyms of the emotion from Oxford API
    if (emotion) {
        moody.getGiphy(emotion);
        moody.getSynonyms(emotion);
    }
};

moody.updateDB = function (mood) {
    // adds mood to globalMoods, then updates database
    if (mood) {
        if (moody.globalMoods[mood] > 0) {
            moody.globalMoods[mood] += 1;
        } else {
            moody.globalMoods[mood] = 1;
        }
        dbMoody.set(moody.globalMoods);
    }
;}

moody.events = function () {
    // when an emotion is clicked from the landing page, 
    // hides landing page section and un-hides cloud and gif section
    $('.emotion').on('click', function() {
        const mood = $(this).text();
        moody.toggleHidden('.landingPage');
        moody.toggleHidden('.cloudAndGif');
        moody.getEmotion(mood);

        //sets background color according to chosen emotion
        if (mood === 'happy'){
            moody.bckgrndColor('#F6F807', '#FF8C42');
        } else if (mood === 'angry') {
            moody.bckgrndColor('lightgray', 'rgb(255, 0, 50)');
        } else {
            if (mood === 'sad') {
                moody.bckgrndColor('lightblue', 'rgb(0, 111, 250)');
            } else {
                moody.bckgrndColor('#AFE5DF', '#414C2E');
            }
        }
    });

    $('#keywords').find('span').on('click', function () {
    // when an emotion is clicked from the word cloud, gets a gif and more synonyms
        const mood = $(this).text();
        moody.getEmotion(mood);
        moody.updateDB(mood);
    });

    $('form').on('submit', function (e) {
        // when someone enters their own emotion, get gif and synonyms
        e.preventDefault();
        const userEmotion = $('input').val();
        moody.getEmotion(String(userEmotion));
        $(this).trigger('reset');
        moody.updateDB(userEmotion);
    });

    $('.restart').on('click', function() {
        window.location = '';
    });

    let backToggle = true;
    // toggles text of global button between see global and back
    $('.globalButton').on('click', function () {
        moody.makeGlobalCloud();
        moody.toggleHidden('#keywords');
        moody.toggleHidden('#iframe');
        moody.toggleHidden('.global');
        moody.toggleHidden('form');
        moody.toggleHidden('.newGif');
        if (backToggle) {
            $(this).text('back');
            backToggle = false;
        } else {
            $(this).text('global');
            backToggle = true;
        }
    });
    
    $('.newGif').on('click', function () {
        // gets a new gif without calling API again
        moody.getNewGif(moody.currentMoodGifs);
    });
};

$(moody.init());
