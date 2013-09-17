var app = angular.module("MainApp", [], function ($locationProvider) {
    $locationProvider.html5Mode(true);
});

var Database = function (apiKey) {
    this.apiKey = apiKey;
    this.dbUrl = 'https://api.mongolab.com/api/1/databases';
    this.dbName = 'sylys_public';
};

Database.prototype.getResultsByCid = function (cid) {
    var url = this.dbUrl + '/' + this.dbName + '/collections/' + cid + '?apiKey=' + this.apiKey;
    var ajaxOpt = {
        url: url,
        type: 'GET',
        contentType: 'application/json;charset=utf-8'
    };

    return Q.when($.ajax(ajaxOpt));
}

app.controller('Main', ['$scope', '$http', '$templateCache', '$location', function ($scope, $http, $templateCache, $location) {

    $scope.cid = $location.search()['cid'];
    $scope.isDataReady = false;
    $scope.showCategoryType = 'kGraph';

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

    var findByFieldValue = function (arr, field, value) {
        var count = arr.length;
        var i;
        for (i = 0; i < count; i++) {
            if (arr[i][field] == value) {
                return arr[i];
            }
        }
        return null;
    };
    var indexOfByFieldValue = function (arr, field, value) {
        var count = arr.length;
        var i;
        for (i = 0; i < count; i++) {
            if (arr[i][field] == value) {
                return i;
            }
        }
        return -1;
    };

    var calculateResults = function (rawResults) {
        var results = {
            categories: []
        };
        var rawResultsCount = rawResults.length;
        var i;
        var categories;
        var categoryCount;
        var resultCategory;
        var questions;
        var questionCount;
        var resultQuestion;
        var j;
        var k;
        var categoryIndex;
        var categoryCanvasId;
        var canvas;
        var context;

        // answerCount
        results.answerCount = rawResultsCount;

        // sum up categories
        for (i = 0; i < rawResultsCount; i++) {
            categories = rawResults[i].categories;
            categoryCount = categories.length;
            for (j = 0; j < categoryCount; j++) {
                resultCategory = findByFieldValue(results.categories, 'text', categories[j].value);
                if (!resultCategory) {
                    resultCategory = {
                        text: categories[j].value,
                        min: categories[j].finalScore,
                        max: categories[j].finalScore,
                        sum: categories[j].finalScore,
                        questions: [],
                        count: 1,
                        avg: 0,
                        lowCount: 0,
                        medCount: 0,
                        highCount: 0
                    };
                    results.categories.push(resultCategory);
                } else {
                    if (resultCategory.min > categories[j].finalScore) {
                        resultCategory.min = categories[j].finalScore;
                    }
                    if (resultCategory.max < categories[j].finalScore) {
                        resultCategory.max = categories[j].finalScore;
                    }
                    resultCategory.sum += categories[j].finalScore;
                    resultCategory.count++;
                }

                resultCategory.lowCount += $scope.isCategoryLow(categories[j].finalScore) ? 1 : 0;
                resultCategory.medCount += $scope.isCategoryNeutral(categories[j].finalScore) ? 1 : 0;
                resultCategory.highCount += $scope.isCategoryHigh(categories[j].finalScore) ? 1 : 0;


            }
        }

        // avg up categories
        categoryCount = results.categories.length;
        for (i = 0; i < categoryCount; i++) {
            results.categories[i].avg = results.categories[i].sum / results.categories[i].count;
        }

        // calculate graph
        categoryCount = results.categories.length;
        for (i = 0; i < categoryCount; i++) {
            var totalWidth = 190;
            var totalCount = results.categories[i].lowCount + results.categories[i].medCount + results.categories[i].highCount;
            results.categories[i].lowGraphWidth = (results.categories[i].lowCount / totalCount) * totalWidth;
            results.categories[i].medGraphWidth = (results.categories[i].medCount / totalCount) * totalWidth;
            results.categories[i].highGraphWidth = (results.categories[i].highCount / totalCount) * totalWidth;
        }

        // sum up questions
        for (i = 0; i < rawResultsCount; i++) {
            questions = rawResults[i].questions;
            questionCount = questions.length;
            for (j = 0; j < questionCount; j++) {
                resultCategory = findByFieldValue(results.categories, 'text', questions[j].category.value);
                resultQuestion = findByFieldValue(resultCategory.questions, 'text', questions[j].text);
                if (!resultQuestion) {
                    resultQuestion = {
                        text: questions[j].text,
                        values: [0, 0, 0, 0, 0],
                        count: 1
                    };
                    resultQuestion.values[questions[j].score + 2]++;
                    resultCategory.questions.push(resultQuestion);
                } else {
                    resultQuestion.values[questions[j].score + 2]++;
                    resultQuestion.count++;
                }
            }
        }

        categoryCount = results.categories.length;
        for (i = 0; i < categoryCount; i++) {
            // avg up questions
            questionCount = results.categories[i].questions.length;
            for (k = 0; k < questionCount; k++) {
                for (j = 0; j < 5; j++) {
                    results.categories[i].questions[k].values[j] /= results.categories[i].questions[k].count;
                    results.categories[i].questions[k].values[j] *= 100;
                }
            }
        }


        return results;
    };

    db.getResultsByCid($scope.cid).then(function (results) {
        $scope.results = calculateResults(results);
        $scope.isDataReady = true;
        $scope.safeApply();
    }).done();

    $scope.isCategoryLow = function (score) {
        return score <= -0.51;
    };
    $scope.isCategoryNeutral = function (score) {
        return !($scope.isCategoryLow(score) || $scope.isCategoryHigh(score));
    };
    $scope.isCategoryHigh = function (score) {
        return score >= 0.51;
    };

    $scope.categoryLowStyle = function (category) {
        return {
            width: category.lowGraphWidth
        };
    };
    $scope.categoryMedStyle = function (category) {
        return {
            width: category.medGraphWidth
        };
    };
    $scope.categoryHighStyle = function (category) {
        return {
            width: category.highGraphWidth
        };
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
