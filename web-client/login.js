this.jumboHeight = $('.jumbotron').outerHeight();
function parallax(){
    var scrolled = $(window).scrollTop();

    $('.jumbotronbg').css('height', ($('.jumbotron').outerHeight()-scrolled) + 'px');
}

$(".jumbotronbutton").on('click', function(e) {
console.log("doing scroll?")
   // prevent default anchor click behavior
   e.preventDefault();

   // animate
   $('html, body').animate({
       scrollTop: $(this.hash).offset().top
     }, 300, function(){

       // when done, add hash to url
       // (default click behaviour)
       window.location.hash = this.hash;
     });

});

$(window).scroll(function(e){
    parallax();
});
