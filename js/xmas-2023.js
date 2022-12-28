// FUNCIONES
    // 00 - Animación inicial
    // 01 - Mostrar Tarjeta
    // 02 - Cerrar Tarjeta
    // 03 - Lightbox
    // 04 - Abrir Juego

//  DISPARADORES
    // 00 - Animación inicial
    // 01 - Mostrar Tarjeta
    // 02 - Cerrar Tarjeta
// ------------------------------------------ 

$(function(){

    const iniciarAnimacion = () => {
        $('.ooo-anima-bg').removeClass('ooo-off');
        $('.ooo-logo-20').addClass('ooo-active');
        $('.ooo-logo-years').addClass('ooo-active');
        $('.ooo-logo01').addClass('ooo-active');
        setTimeout( function() {
            $('.ooo-logo-years').removeClass('ooo-active');
            $('.ooo-anima-bg').addClass('ooo-off');
            $('.ooo-logo-20').addClass('ooo-position');
        }, 3000);
        setTimeout( function() {
            $('.ooo-logo02').addClass('ooo-active');
            $('.ooo-logo03').addClass('ooo-active');
            $('.ooo-logo04').addClass('ooo-active');
            $('.ooo-logo05').addClass('ooo-active');
            $('.ooo-logo06').addClass('ooo-active');
        
        }, 4000);
        setTimeout( function() {
            $('.ooo-animaLogo').addClass('ooo-off');
            $('.ooo-decora').addClass('ooo-active');
        }, 7000);
        setTimeout( function() {
            $('.ooo-animaLogo').hide();
        }, 8000);
        setTimeout( function() {
            $('.ooo-animaMano').addClass('ooo-a1');
            $('.ooo-cube[data-cube="c-13"]').addClass('ooo-active');
        }, 7000);
        setTimeout( function() {
            $('.ooo-animaMano').addClass('ooo-a2');
            $('.ooo-cube[data-cube="c-12"]').addClass('ooo-active');
            $('.ooo-cube[data-cube="c-13"]').removeClass('ooo-active');
        }, 8000);
        setTimeout( function() {
            $('.ooo-animaMano').addClass('ooo-a3');
            $('.ooo-cube[data-cube="c-12"]').removeClass('ooo-active');
        }, 9000);
        setTimeout( function() {
            $('.ooo-animaMano').hide();
        }, 11000);


    }
    
    // 01 - Mostrar Tarjeta
    const showCard = (thisBox) => {
        let VW = $(window).innerWidth();
        let VH = $(window).innerHeight();
        let tree = $('.ooo-tree').innerWidth();
        let thisCube = thisBox.data().cube;

        if( $(".ooo-active").length ){
            if($(thisBox).hasClass('ooo-active')){
                closeCad();
            }
        }
        $(thisBox).addClass('ooo-active');
        $(thisBox).addClass('ooo-openBox');
        // En tamaños pequeños esperamos para ver que la caja se abre ya que la caja tapa el arbol
        let espera = VW < 1000 ? showLightBox(thisCube, 500) : showLightBox(thisCube, 0);
    }

    // 02 - Cerrar Tarjeta
    const closeCad = () => {  
        $('.js-lightBox').removeClass('ooo-active');
        $('.js-lightBox > div').removeClass('ooo-active');
        $('body').removeClass('ooo-active');
        let pLay = $('.ooo-cube').length == $('.ooo-openBox').length ? openGame() : '';
        
    }

    // 03 - Mostrar LightBox
    const showLightBox = (thisCube, windowSize) => {  
        setTimeout( function() { 
            $('.ooo-lightBox').addClass('ooo-active');
            $('.ooo-lightBox').find('#'+thisCube).addClass('ooo-active');
            $('body').addClass('ooo-active');
        }, windowSize);
    }

    // 04 - Abrir Juego
    const openGame = () => {
        $('.ooo-cube').removeClass('ooo-active');
        $('body').addClass('ooo-inGame');
        setTimeout( function() {
            $( "#ooo-game" ).addClass('ooo-active');
        }, 1000);
    }


// -----------------------------------------------------------------------------------------------------------
//  DISPARADORES
    // 00 - Animación inicial
    iniciarAnimacion();

    // 01- Mostrar Tarjeta
    $(".js-openCard").click(function () {
        let thisBox = $(this);
        showCard(thisBox);
    });

    // 02- Cerrar Tarjeta
    $(".js-lightBox").click(function () {
        closeCad();
    });

    $(document).on('keydown', function(event) {
        if (event.key == "Escape") {
            closeCad();
        }
    });

    $('.logo-osoco a').click(function (event) {
        event.preventDefault();
        openGame();
    });
});
