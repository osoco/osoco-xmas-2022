// FUNCIONES
    // 01 - Mostrar Tarjeta
    // 02 - Cerrar Tarjeta
    // 03 - Lightbox
    // 04 - Abrir Juego

//  DISPARADORES
    // 01 - Mostrar Tarjeta
    // 02 - Cerrar Tarjeta
// ------------------------------------------ 

$(function(){
    
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
    // 01- Mostrar Tarjeta
    $(".js-openCard").click(function () {
        let thisBox = $(this);
        showCard(thisBox);
    });

    // 02- Cerrar Tarjeta
    $(".js-lightBox").click(function () {
        closeCad();
    });
});
