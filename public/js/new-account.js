$( function() {
  $('#account-connect').on('click', function() {
    var accountCode = $('#account-code').val().trim();
    Q.when($.post( '/account-connect', { accountCode: accountCode } ))
      .then( function() {
        window.location.replace('/');
      }).done();
  });
});
