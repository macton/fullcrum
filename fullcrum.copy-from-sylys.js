var fs               = require('fs');
var Q                = require('q');
var fullcrumConfig   = require('./fullcrum.config');
var sylysConfig      = require('./sylys.config');
var mongoq           = require('./mongoq');
var fullcrumMaster = require('./fullcrum.master.config');

// #todo questionnaire name: 'Fullcrum Master'
// #todo company -> questionnaireId

var fullcrumDb = mongoq.Db( fullcrumConfig.mongoDbUrl );
var sylysDb    = mongoq.Db( sylysConfig.mongoDbUrl );
var sylysCategories;
var sylysQuestions;
var sylysResponses;
var fullcrumCategories;
var fullcrumQuestions;
var fullcrumResponses;
var fullcrumSuggestions;
var fullcrumSummaryResponses;

Q.all( [ fullcrumDb.connect(), sylysDb.connect() ] )
  .then( function() {
    console.log('# get sylys source');
    return sylysDb.collection('source')
      .then( function( collection ) {
        return sylysDb.collectionFindOneById( collection, sylysConfig.sourceId );
      })
      .then( function( source ) {
        sylysCategories = source.categories;
        sylysQuestions  = source.questions;
        sylysResponses  = source.responses;
      });
  })

  .then( function() {
    console.log('# remove old data');
    var categoryCollection;
    var questionCollection;
    return Q.all( [ fullcrumDb.collection('Categories'), fullcrumDb.collection('Questions'), fullcrumDb.collection('Responses'), fullcrumDb.collection('Suggestions') ] )
      .then( function( collections ) {
        categoryCollection   = collections[0];
        questionCollection   = collections[1];
        responseCollection   = collections[2];
        suggestionCollection = collections[3];
      })
      .then( function() {
        console.log('# find any categories assigned to default questionnaire');
        return fullcrumDb.collectionFind( categoryCollection, { questionnaireId: fullcrumMaster.questionnaire._id } );
      })
      .then( function( oldFullcrumCategories ) {
        console.dir( oldFullcrumCategories );
        console.log('# remove any questions assigned to old categories');
        var removePromises = [];
        for (var i=0;i<oldFullcrumCategories.length;i++) {
          var oldCategoryId = oldFullcrumCategories[i]._id.toHexString();
          console.log('# remove questions with categoryId ' + oldCategoryId );
          removePromises.push( fullcrumDb.collectionRemove( questionCollection, { categoryId: oldCategoryId } ) );
        }
        console.log('# remove any responses assigned to old categories');
        var removePromises = [];
        for (var i=0;i<oldFullcrumCategories.length;i++) {
          var oldCategoryId = oldFullcrumCategories[i]._id.toHexString();
          console.log('# remove responses with categoryId ' + oldCategoryId );
          removePromises.push( fullcrumDb.collectionRemove( responseCollection, { categoryId: oldCategoryId } ) );
        }
        console.log('# remove any suggestions assigned to old categories');
        var removePromises = [];
        for (var i=0;i<oldFullcrumCategories.length;i++) {
          var oldCategoryId = oldFullcrumCategories[i]._id.toHexString();
          console.log('# remove suggestions with categoryId ' + oldCategoryId );
          removePromises.push( fullcrumDb.collectionRemove( suggestionCollection, { categoryId: oldCategoryId } ) );
        }
        return Q.all( removePromises )
          .then( function( results ) {
            console.dir( results );
          });
      })
      .then( function() {
        console.log('# remove any categories assigned to default questionnaire');
        return fullcrumDb.collectionRemove( categoryCollection, { questionnaireId: fullcrumMaster.questionnaire._id } )
          .then( function( results ) {
            console.dir( results );
          });
      })
  })

  .then( function() {
    console.log('# add categories to default questionnaire');
    return fullcrumDb.collection('Categories')
      .then( function( collection ) {
        var categories = [];
        for (var i=0;i<sylysCategories.length;i++) {
          categories.push( { text: sylysCategories[i].value, questionnaireId: fullcrumMaster.questionnaire._id } );
        }
        return fullcrumDb.collectionInsert( collection, categories );
      })
      .then( function( results ) {
        fullcrumCategories = results;
        console.dir( results );
      });
  })

  .then( function() {
    console.log('# add questions to categories');

    // map sylysQuestions to fullcrumCategories
    var questions = [];
    var findCategoryIdByText = function( sylysCategoryText ) {
      return fullcrumCategories.filter( function( category ) {
        return category.text == sylysCategoryText;
      })[0]._id.toHexString();
    }
    for (var i=0;i<sylysQuestions.length;i++) {
      questions.push( { text: sylysQuestions[i].text, categoryId: findCategoryIdByText( sylysQuestions[i].category.value ) } );
    }

    return fullcrumDb.collection('Questions')
      .then( function( collection ) {
        return fullcrumDb.collectionInsert( collection, questions );
      })
      .then( function( results ) {
        fullcrumQuestions = results;
        console.dir( results );
      });
  })

  .then( function() {
    console.log('# add responses to categories');

    // map sylysResponses to fullcrumCategories
    var responses = [];
    var findCategoryIdByText = function( sylysCategoryText ) {
      return fullcrumCategories.filter( function( category ) {
        return category.text == sylysCategoryText;
      })[0]._id.toHexString();
    }
    for (var i=0;i<sylysResponses.categories.length;i++) {
      var responseLow     = sylysResponses.categories[i].low;
      var responseNeutral = sylysResponses.categories[i].neutral;
      var responseHigh    = sylysResponses.categories[i].high;
      responses.push( { text: responseLow,     responseType: 'kNegative', categoryId: findCategoryIdByText( sylysCategories[i].value ) } );
      responses.push( { text: responseNeutral, responseType: 'kNeutral',  categoryId: findCategoryIdByText( sylysCategories[i].value ) } );
      responses.push( { text: responseHigh,    responseType: 'kPositive', categoryId: findCategoryIdByText( sylysCategories[i].value ) } );
    }

    return fullcrumDb.collection('Responses')
      .then( function( collection ) {
        return fullcrumDb.collectionInsert( collection, responses );
      })
      .then( function( results ) {
        fullcrumResponses = results;
        console.dir( results );
      });
  })

  .then( function() {
    console.log('# add suggestions to categories');

    // map sylysResponses to fullcrumCategories
    var suggestions = [];
    var findCategoryIdByText = function( sylysCategoryText ) {
      return fullcrumCategories.filter( function( category ) {
        return category.text == sylysCategoryText;
      })[0]._id.toHexString();
    }
    for (var i=0;i<sylysResponses.categories.length;i++) {
      if ( sylysResponses.categories[i].suggestionList ) {
        for (var j=0;j<sylysResponses.categories[i].suggestionList.length;j++) {
          var sylysSuggestion = sylysResponses.categories[i].suggestionList[j];
          var suggestion = { 
            text:         sylysSuggestion.text, 
            responseType: 'kAny', 
            categoryId: findCategoryIdByText( sylysCategories[i].value ) 
          };
          if ( sylysSuggestion.url && ( sylysSuggestion.url.length > 0 ) ) {
            suggestion.moreInfoUrl = sylysSuggestion.url;
          }
          if ( sylysSuggestion.email && ( sylysSuggestion.email.length > 0 ) ) {
            suggestion.authorEmail = sylysSuggestion.email;
          }
          suggestions.push( suggestion );
        }
      }
    }

    return fullcrumDb.collection('Suggestions')
      .then( function( collection ) {
        return fullcrumDb.collectionInsert( collection, suggestions );
      })
      .then( function( results ) {
        fullcrumSuggestions = results;
        console.dir( results );
      });
  })

  .then( function() {
    console.log('# add summary responses to default questionnaire');

    var oneNegativeResponse  = sylysResponses.one;
    var someNegativeResponse = sylysResponses.some;
    var allNegativeResponse  = sylysResponses.all;
    var allPositiveResponse  = sylysResponses.none;

    var summaryResponses = [
      { text: oneNegativeResponse,  summaryType: 'kOneNegative',  questionnaireId: fullcrumMaster.questionnaire._id },
      { text: someNegativeResponse, summaryType: 'kSomeNegative', questionnaireId: fullcrumMaster.questionnaire._id },
      { text: allNegativeResponse,  summaryType: 'kAllNegative',  questionnaireId: fullcrumMaster.questionnaire._id },
      { text: allPositiveResponse,  summaryType: 'kAllPositive',  questionnaireId: fullcrumMaster.questionnaire._id }
    ];

    return fullcrumDb.collection('SummaryResponses')
      .then( function( collection ) {
        return fullcrumDb.collectionInsert( collection, summaryResponses );
      })
      .then( function( results ) {
        fullcrumSummaryResponses = results;
        console.dir( results );
      });
  })

  // close and exit
  .then( function() {
    return Q.all( [ fullcrumDb.close(), sylysDb.close() ] )
      .then( function() {
        process.exit();
      });
  })

  .fail( function( err ) {
    console.log( err );
    console.log( err.stack );
    process.exit();
  });

/*
Collection About
  Text                     text

Collection Admins
  Text                      name
  Email                     email
  Text                      loginId

Collection Companies
  Text                      name

Collection CompanyAdmins
  $oid.Companies.Company    companyId
  Text                      name
  Email                     email
  Text                      loginId

Collection Tokens
  $oid.Companies.Company    companyId
  Date                      creationDate
  Email                     providerEmail
  Date                      spentDate
  Email                     spenderEmail

Collection Categories
  $oid.Companies.Company    companyId
  Text                      text

Collection Questions
  $oid.Categories.Category  categoryId
  Text                      text

Select ResponseType
  kPositive
  kNeutral
  kNegative
  kAny

Select SummaryType
  kOneNegative
  kSomeNegative
  kAllNegative
  kAllPositive

Collection Responses
  $oid.Categories.Category  categoryId
  Text                      text
  ResponseType              responseType

Collection Suggestions
  $oid.Categories.Category  categoryId
  Text                      text
  Email                     authorEmail
  Url                       moreInfoUrl

Collection SummaryResponses
  $oid.Companies.Company    companyId
  Text                      text
  SummaryType               summaryType
*/
