var app = angular.module("MainApp", [], function ($locationProvider) {
    $locationProvider.html5Mode(true);
});

function shuffle(o) { //v1.0
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function cloneObjPreSave(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [],
            i = 0,
            len = obj.length;
        for (; i < len; i++) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        var hashKey;
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (i != '$$hashKey') {
                    out[i] = arguments.callee(obj[i]);
                }
            }
        }
        return out;
    }
    return obj;
}

function getGravatarImageUrl(md5) {
    return 'http://www.gravatar.com/avatar/' + md5 + '?d=wavatar';
};

var Database = function (apiKey) {
    this.apiKey = apiKey;
    this.dbUrl = 'https://api.mongolab.com/api/1/databases';
    this.dbName = 'sylys_public';
    this.sourceCollectionName = 'source';
    this.sourceCollectionUrl = this.dbUrl + '/' + this.dbName + '/collections/' + this.sourceCollectionName + '?apiKey=' + this.apiKey;
};

Database.prototype.getSource = function () {
    var self = this;
    var url = self.sourceCollectionUrl;
    var ajaxOpt = {
        url: url,
        type: 'GET',
        contentType: 'application/json;charset=utf-8'
    };

    return Q.when($.ajax(ajaxOpt));
}

Database.prototype.saveResults = function (cid, uid, results) {
    var self = this;
    var url = this.dbUrl + '/' + this.dbName + '/collections/' + cid + '?apiKey=' + this.apiKey;
    results = cloneObjPreSave(results);
    results.cid = cid;
    results.uid = uid;
    delete results.responses;
    delete results._id;

    var ajaxOpt = {
        url: url,
        type: 'POST',
        data: JSON.stringify(results),
        contentType: 'application/json;charset=utf-8'
    };

    return Q.when($.ajax(ajaxOpt));
}

app.controller('Main', ['$scope', '$http', '$templateCache', '$location', function ($scope, $http, $templateCache, $location) {

    $scope.cid = $location.search()['cid'];
    $scope.uid = $location.search()['uid'];

    $scope.hasStats = function () {
        return $scope.cid && $scope.uid;
    };

    $scope.isDataReady = false;
    $scope.isQuestionnaireDone = false;
    $scope.questionNdx = 0;
    $scope.isSuggestionShow = [];
    $scope.isSuggestionUserShow = [];
    $scope.gravatarInfo = {};

    var db = new Database('g2xhW81Lhrl8PCaXtveN_3QAn3t_tVc1');
    var sourceDefault = {
        categories: [],
        questions: [],
        responses: {
            categories: [],
            none: '',
            one: '',
            some: '',
            all: ''
        }
    };

    var loadGravatarProfile = function (email) {
        $.ajax("http://en.gravatar.com/" + $scope.gravatarInfo[email].emailHash + ".json", {
            dataType: "jsonp"
        }).done(function (result) {
            $scope.gravatarInfo[email].profile = result.entry[0];
            $scope.safeApply();
        }).fail(function (result) {
            console.log("gravatar profile fail", arguments);
        });
    }

    db.getSource().then(function (results) {
        $scope.source = sourceDefault;
        var i;
        for (i = 0; i < results.length; i++) {
            if (results[i]['_id']['$oid'] == '51f2af89e4b057d9465930c0') {
                $scope.source = results[i];
                break;
            }
        }

        // convert select copies to references 
        // (select values are matched by pointer)
        var i;
        var j;
        var questions = $scope.source.questions;
        var questionsCount = questions.length;
        var categoryNdx;
        var suggestions;
        var suggestionCount;
        var email;
        var email_hash;

        for (i = 0; i < questionsCount; i++) {
            categoryNdx = questions[i].category.key;
            questions[i].category = $scope.source.categories[categoryNdx];

            // clear scores
            questions[i].score = 0;
            questions[i].category.score = 0;
            questions[i].category.maxScore = 0;

            // update gravatar image data
            if ($scope.source.responses.categories[i]) {
                suggestions = $scope.source.responses.categories[i].suggestionList;
                if (suggestions) {
                    suggestions = shuffle(suggestions);
                    suggestionCount = suggestions.length;
                    for (j = 0; j < suggestionCount; j++) {
                        email = suggestions[j].email;
                        $scope.gravatarInfo[email] = {};
                        if (email) {
                            email_hash = $.md5(email);
                            $scope.gravatarInfo[email].emailHash = email_hash;
                            $scope.gravatarInfo[email].imageUrl = getGravatarImageUrl(email_hash);
                        }
                    }
                }
            }
        }

        // update gravatar profile data
        for (email in $scope.gravatarInfo) {
            if ($scope.gravatarInfo.hasOwnProperty(email)) {
                loadGravatarProfile(email);
            }
        }

        // shuffle questions
        $scope.source.questions = shuffle($scope.source.questions);

        $scope.isDataReady = true;
        $scope.safeApply();
    }).done();

    $scope.isFirstQuestion = function() {
      return $scope.questionNdx == 0;
    }

    $scope.onPrev = function () {
        var questionNdx = $scope.questionNdx - 1;
        var question = $scope.source.questions[questionNdx];
        var category = question.category;

        // back out score
        category.score -= question.score;
        question.score = 0;
        category.maxScore -= 2;

        $scope.questionNdx = questionNdx;
        $('#progress').width(parseInt(($scope.questionNdx / $scope.source.questions.length) * 523) + 'px');
        $scope.safeApply();
    };
    var resolveScores = function () {
        var categories = $scope.source.categories;
        var categoryCount = categories.length;
        var negCategories = [];
        var negCount = 0;
        var i;
        for (i = 0; i < categoryCount; i++) {
            categories[i].finalScore = categories[i].score / categories[i].maxScore;
            if ($scope.isCategoryLow(categories[i])) {
                negCount++;
                negCategories.push(categories[i].value);
            }
        }

        // patch response text
        var negCategoryList = negCategories.join(', ');
        $scope.source.responses.some = $scope.source.responses.some.replace(/<list of negative categories>/, negCategoryList);
        $scope.source.responses.one = $scope.source.responses.one.replace(/<negative category>/, negCategoryList);

/*        
        $scope.source.categories.sort( function( a, b ) {
            return a.finalScore - b.finalScore;
        });
*/
        $scope.source.negCount = negCount;
        $scope.saveResults();

    };

    $scope.saveResults = function () {
        $scope.isStatsError = false;
        $scope.isStatsSaved = false;
        $scope.safeApply();

        db.saveResults($scope.cid, $scope.uid, $scope.source).fail(function () {
            $scope.isStatsError = true;
            $scope.safeApply();
        }).then(function () {
            $scope.isStatsSaved = true;
            $scope.safeApply();
        }).done();
    };

    $scope.onSelectResponse = function (response) {
        var questionNdx = $scope.questionNdx;
        var question = $scope.source.questions[questionNdx];
        var category = question.category;

        question.score = response;
        category.maxScore += 2;
        category.score += response;

        $scope.questionNdx++;
        $('#progress').width(parseInt(($scope.questionNdx / $scope.source.questions.length) * 523) + 'px');
        if ($scope.questionNdx == $scope.source.questions.length) {
            resolveScores();
            $scope.isQuestionnaireDone = true;
        }
        $scope.safeApply();
    };
    $scope.showSuggestion = function (ndx) {
        $scope.isSuggestionShow[ndx] = true;
        $scope.isSuggestionUserShow[ndx] = [];
        $scope.safeApply();
    };
    $scope.hideSuggestion = function (ndx) {
        $scope.isSuggestionShow[ndx] = false;
        $scope.safeApply();
    };
    $scope.showSuggestionUser = function (categoryNdx, suggestionNdx) {
        $scope.isSuggestionUserShow[categoryNdx][suggestionNdx] = true;
        $scope.safeApply();
    }
    $scope.hideSuggestionUser = function (categoryNdx, suggestionNdx) {
        $scope.isSuggestionUserShow[categoryNdx][suggestionNdx] = false;
        $scope.safeApply();
    }
    $scope.isCategoryLow = function (category) {
        return category.finalScore <= -0.51;
    };
    $scope.isCategoryNeutral = function (category) {
        return !($scope.isCategoryLow(category) || $scope.isCategoryHigh(category));
    };
    $scope.isCategoryHigh = function (category) {
        return category.finalScore >= 0.51;
    };

    $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase == '$apply' || phase == '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

}]);
