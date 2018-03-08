this.jumboHeight = $('.jumbotron').outerHeight();
function parallax(){
    var scrolled = $(window).scrollTop();

    $('.jumbotronbg').css('height', ($('.jumbotron').outerHeight()-scrolled) + 'px');
}

$(window).scroll(function(e){
    parallax();
});
